import { Types } from 'mongoose';
import { genAI, AI_MODEL, AI_TEMPERATURE } from '@/lib/integrations/openai';
import { Conversation, Profile, Tenant } from '@/lib/db/models';
import { IConversation, IProfile } from '@/types';
import { CalendarService } from './calendar.service';
import { LeadService } from './lead.service';
import { cacheGet, cacheSet } from '@/lib/utils/redis';

export class AISecretaryService {
  /**
   * Send a message to the AI and get a response
   */
  static async chat(data: {
    profileId: string;
    sessionId: string;
    message: string;
    visitorInfo?: {
      name?: string;
      email?: string;
      company?: string;
    };
  }): Promise<{
    reply: string;
    sessionId: string;
    state: IConversation['status'];
    conversation: IConversation;
  }> {
    // Get profile
    const profile = await Profile.findById(data.profileId).populate('tenantId');
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Check AI quota
    const tenant = profile.tenantId as any;
    if (!tenant.hasAiQuota()) {
      throw new Error('AI usage limit exceeded. Please upgrade your plan.');
    }

    // Get or create conversation
    let conversation = await Conversation.findOne({
      profileId: data.profileId,
      visitorId: data.sessionId,
      status: { $in: ['active', 'qualified'] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        tenantId: profile.tenantId,
        profileId: data.profileId,
        visitorId: data.sessionId,
        messages: [],
        status: 'active',
      });
    }

    // Update lead info if provided
    if (data.visitorInfo) {
      conversation.leadInfo = {
        ...conversation.leadInfo,
        ...data.visitorInfo,
      };
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: data.message,
      timestamp: new Date(),
    });

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(profile);

    // Build chat history for Gemini
    const chatHistory = conversation.messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const fullPrompt = `${systemPrompt}\n\nConversation so far:\n${chatHistory}\n\nUser: ${data.message}\n\nAssistant:`;

    try {
      // Call Google Gemini API using v1 API (not v1beta)
      // The SDK v0.22+ automatically uses v1 API endpoints
      const model = genAI.getGenerativeModel({ model: AI_MODEL });
      
      // Build function definitions for Gemini (tools parameter)
      const tools = this.buildGeminiTools();
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        tools: tools.length > 0 ? tools : undefined,
        generationConfig: {
          temperature: AI_TEMPERATURE,
          maxOutputTokens: 1000,
        },
      });

      const response = result.response;
      let assistantReply = response.text();
      
      // Check if Gemini wants to call a function
      try {
        const functionCalls = response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
          // Execute function calls
          for (const functionCall of functionCalls) {
            const functionResult = await this.executeFunctionCall(
              functionCall.name,
              functionCall.args as any,
              profile,
              conversation
            );
            
            // Get follow-up response from AI with function result
            const followUpResult = await model.generateContent({
              contents: [
                { role: 'user', parts: [{ text: fullPrompt }] },
                { role: 'model', parts: [{ text: assistantReply }, { functionCall: functionCall }] },
                { role: 'function', parts: [{ functionResponse: { name: functionCall.name, response: functionResult } }] },
              ],
              tools: tools.length > 0 ? tools : undefined,
              generationConfig: {
                temperature: AI_TEMPERATURE,
                maxOutputTokens: 1000,
              },
            });
            
            assistantReply = followUpResult.response.text();
          }
        }
      } catch (functionError) {
        // If function calling fails, continue with text response
        console.warn('Function calling not available or failed, using text-only mode:', functionError);
      }

      // Add AI response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: assistantReply,
        timestamp: new Date(),
      });

      await conversation.save();

      // Increment AI usage
      await tenant.incrementAiUsage();

      // Check if AI suggests meeting booking (simple parsing for MVP)
      const lowerReply = assistantReply.toLowerCase();
      if (lowerReply.includes('book') || lowerReply.includes('schedule') || lowerReply.includes('meeting')) {
        // Update status to show booking intent
        if (conversation.leadInfo?.email) {
          conversation.status = 'qualified';
          await conversation.save();
        }
      }

      return {
        reply: assistantReply,
        sessionId: data.sessionId,
        state: conversation.status,
        conversation,
      };
    } catch (error: any) {
      console.error('AI chat error:', error);
      throw new Error('Failed to get AI response: ' + error.message);
    }
  }

  /**
   * Build system prompt from profile configuration
   */
  private static buildSystemPrompt(profile: IProfile): string {
    const { aiConfig, displayName, title, company } = profile;

    return `You are an AI secretary for ${displayName}, a ${title} at ${company}.

Your role:
1. Greet visitors warmly and professionally
2. Collect their name, company, and reason for meeting
3. Qualify leads by asking: ${aiConfig.qualificationQuestions.join(', ')}
4. If qualified, propose available meeting times
5. Book meetings automatically if visitor confirms
6. If you cannot help, politely escalate to human

Rules:
- Never hallucinate meeting times - only use slots from checkAvailability function
- Never confirm bookings without explicit visitor consent
- Be concise and professional (2-3 sentences max per response)
- Ask one question at a time
- If visitor seems frustrated or requests human, escalate immediately
- Use visitor's timezone for all times
- Confirm all details before booking
- Personality: ${aiConfig.personality}

Initial greeting: "${aiConfig.greeting}"

Available functions:
- checkAvailability(date, duration, timezone) -> returns available meeting slots
- bookMeeting(startTime, endTime, attendee, notes) -> books a meeting
- escalateToHuman(reason) -> escalates to profile owner`;
  }

  /**
   * Build Gemini tools (function definitions)
   */
  private static buildGeminiTools(): any[] {
    return [
      {
        functionDeclarations: [
          {
            name: 'checkAvailability',
            description: 'Check calendar availability for meeting slots on a specific date',
            parameters: {
              type: 'object',
              properties: {
                date: {
                  type: 'string',
                  description: 'Date in YYYY-MM-DD format',
                },
                duration: {
                  type: 'number',
                  description: 'Meeting duration in minutes (default: 30)',
                },
                timezone: {
                  type: 'string',
                  description: 'Visitor timezone (IANA format, e.g., America/New_York)',
                },
              },
              required: ['date', 'timezone'],
            },
          },
          {
            name: 'bookMeeting',
            description: 'Book a confirmed meeting after visitor approval',
            parameters: {
              type: 'object',
              properties: {
                startTime: {
                  type: 'string',
                  description: 'Meeting start time in ISO 8601 format',
                },
                endTime: {
                  type: 'string',
                  description: 'Meeting end time in ISO 8601 format',
                },
                attendee: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                  },
                  required: ['name', 'email'],
                },
                notes: {
                  type: 'string',
                  description: 'Meeting notes or agenda',
                },
              },
              required: ['startTime', 'endTime', 'attendee'],
            },
          },
          {
            name: 'escalateToHuman',
            description: 'Escalate conversation to profile owner when visitor needs human assistance',
            parameters: {
              type: 'object',
              properties: {
                reason: {
                  type: 'string',
                  description: 'Reason for escalation',
                },
              },
              required: ['reason'],
            },
          },
        ],
      },
    ];
  }

  /**
   * Build OpenAI function definitions (legacy, kept for reference)
   */
  private static buildFunctions(): any[] {
    return [
      {
        name: 'checkAvailability',
        description: 'Check calendar availability for meeting slots',
        parameters: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description: 'Date in YYYY-MM-DD format',
            },
            duration: {
              type: 'number',
              description: 'Meeting duration in minutes (default: 30)',
            },
            timezone: {
              type: 'string',
              description: 'Visitor timezone (IANA format, e.g., America/New_York)',
            },
          },
          required: ['date', 'timezone'],
        },
      },
      {
        name: 'bookMeeting',
        description: 'Book a confirmed meeting after visitor approval',
        parameters: {
          type: 'object',
          properties: {
            startTime: {
              type: 'string',
              description: 'Meeting start time in ISO 8601 format',
            },
            endTime: {
              type: 'string',
              description: 'Meeting end time in ISO 8601 format',
            },
            attendee: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
              },
              required: ['name', 'email'],
            },
            notes: {
              type: 'string',
              description: 'Meeting notes or agenda',
            },
          },
          required: ['startTime', 'endTime', 'attendee'],
        },
      },
      {
        name: 'escalateToHuman',
        description: 'Escalate conversation to profile owner',
        parameters: {
          type: 'object',
          properties: {
            reason: {
              type: 'string',
              description: 'Reason for escalation',
            },
          },
          required: ['reason'],
        },
      },
    ];
  }

  /**
   * Execute function call
   */
  private static async executeFunctionCall(
    functionName: string,
    args: any,
    profile: IProfile,
    conversation: IConversation
  ): Promise<any> {
    switch (functionName) {
      case 'checkAvailability':
        return this.handleCheckAvailability(args, profile);

      case 'bookMeeting':
        return this.handleBookMeeting(args, profile, conversation);

      case 'escalateToHuman':
        return this.handleEscalateToHuman(args, conversation);

      default:
        return { error: 'Unknown function' };
    }
  }

  /**
   * Handle checkAvailability function
   */
  private static async handleCheckAvailability(
    args: { date: string; duration?: number; timezone: string },
    profile: IProfile
  ): Promise<any> {
    try {
      const duration = args.duration || 30;
      
      // Get tenant context for calendar service
      const tenant = profile.tenantId as any;
      // Create a minimal system context for visitor-initiated calls
      const systemUser = {
        id: 'system',
        email: '',
        name: 'System',
        tenantId: (tenant._id || tenant).toString(),
        role: 'admin' as const,
      };
      const { createTenantContext } = await import('@/lib/middleware/tenant');
      const tenantContext = createTenantContext(systemUser);

      // Call CalendarService to get real availability
      const slots = await CalendarService.getAvailability({
        profileId: profile._id.toString(),
        date: args.date,
        duration,
        timezone: args.timezone,
        tenantContext,
      });

      return {
        success: true,
        slots: slots.map(slot => ({
          start: slot.start,
          end: slot.end,
        })),
        timezone: args.timezone,
      };
    } catch (error: any) {
      console.error('Error checking availability:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle bookMeeting function
   */
  private static async handleBookMeeting(
    args: {
      startTime: string;
      endTime: string;
      attendee: { name: string; email: string };
      notes?: string;
    },
    profile: IProfile,
    conversation: IConversation
  ): Promise<any> {
    try {
      // Get tenant context
      const tenant = profile.tenantId as any;
      // Create a minimal system context for visitor-initiated calls
      const systemUser = {
        id: 'system',
        email: '',
        name: 'System',
        tenantId: (tenant._id || tenant).toString(),
        role: 'admin' as const,
      };
      const { createTenantContext } = await import('@/lib/middleware/tenant');
      const tenantContext = createTenantContext(systemUser);

      // Create lead if we have visitor info
      let leadId: string | undefined;
      if (conversation.leadInfo?.email) {
        const lead = await LeadService.createLead(
          {
            profileId: profile._id,
            conversationId: conversation._id,
            name: conversation.leadInfo.name || args.attendee.name,
            email: conversation.leadInfo.email || args.attendee.email,
            company: conversation.leadInfo.company,
            intent: conversation.leadInfo.intent,
            source: 'chat',
            status: 'qualified',
          },
          tenantContext
        );
        leadId = lead._id.toString();
      }

      // Book meeting using CalendarService
      const meeting = await CalendarService.bookMeeting(
        {
          profileId: profile._id.toString(),
          leadId,
          conversationId: conversation._id.toString(),
          title: `Meeting with ${args.attendee.name}`,
          description: args.notes || `Meeting scheduled via AI chat`,
          startTime: args.startTime,
          endTime: args.endTime,
          timezone: profile.timezone || 'UTC',
          attendees: [args.attendee],
        },
        tenantContext
      );

      // Update conversation status
      conversation.status = 'booked';
      await (conversation as any).save();

      return {
        success: true,
        message: 'Meeting booked successfully',
        meetingId: meeting._id.toString(),
        startTime: args.startTime,
        endTime: args.endTime,
      };
    } catch (error: any) {
      console.error('Error booking meeting:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle escalateToHuman function
   */
  private static async handleEscalateToHuman(
    args: { reason: string },
    conversation: IConversation
  ): Promise<any> {
    conversation.status = 'escalated';
    await (conversation as any).save();

    // Send notification to profile owner
    try {
      const profile = await Profile.findById(conversation.profileId).populate('userId');
      if (profile && (profile as any).userId?.email) {
        // In production, this would send an email notification
        // For now, we log it - email service can be added later
        console.log(`Escalation notification for profile ${profile._id}:`, {
          reason: args.reason,
          visitorEmail: conversation.leadInfo?.email,
          conversationId: conversation._id,
          profileOwnerEmail: (profile as any).userId.email,
        });
        
        // TODO: Integrate with email service (nodemailer) to send actual notification
        // await EmailService.sendEscalationNotification({
        //   to: (profile as any).userId.email,
        //   profileName: profile.displayName,
        //   reason: args.reason,
        //   visitorInfo: conversation.leadInfo,
        // });
      }
    } catch (error) {
      console.error('Error sending escalation notification:', error);
    }

    return {
      success: true,
      message: 'Escalated to human',
    };
  }

  /**
   * Get conversation history
   */
  static async getConversation(
    profileId: string,
    sessionId: string
  ): Promise<IConversation | null> {
    return Conversation.findOne({
      profileId,
      visitorId: sessionId,
    });
  }
}
