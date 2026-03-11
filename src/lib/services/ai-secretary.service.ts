import { callOpenRouter, AI_TEMPERATURE, ChatMessage } from '@/lib/integrations/openai';
import { Conversation, Profile } from '@/lib/db/models';
import { IConversation, IProfile } from '@/types';
import { CalendarService } from './calendar.service';
import { LeadService } from './lead.service';

export class AISecretaryService {
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
    const profile = await Profile.findById(data.profileId).populate('tenantId');
    if (!profile) throw new Error('Profile not found');

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

    if (data.visitorInfo) {
      conversation.leadInfo = { ...conversation.leadInfo, ...data.visitorInfo };
    }

    // Build OpenAI-style messages array
    const systemPrompt = this.buildSystemPrompt(profile);

    const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }];

    // Append prior conversation turns
    for (const m of conversation.messages) {
      messages.push({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      });
    }

    // Append the new user message
    messages.push({ role: 'user', content: data.message });

    // Save user message to conversation
    conversation.messages.push({
      role: 'user',
      content: data.message,
      timestamp: new Date(),
    });

    try {
      const assistantReply = await callOpenRouter(messages, {
        temperature: AI_TEMPERATURE,
        max_tokens: 1000,
      });

      // Check for action keywords and handle side-effects
      await this.handleActionKeywords(assistantReply, profile, conversation);

      // Save assistant reply
      conversation.messages.push({
        role: 'assistant',
        content: assistantReply,
        timestamp: new Date(),
      });

      await conversation.save();
      await tenant.incrementAiUsage();

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
   * Detect booking/escalation intent from reply text and act on it.
   */
  private static async handleActionKeywords(
    reply: string,
    profile: IProfile,
    conversation: IConversation
  ) {
    const lower = reply.toLowerCase();

    if (
      (lower.includes('escalat') || lower.includes('transfer') || lower.includes('human agent')) &&
      conversation.status !== 'escalated'
    ) {
      conversation.status = 'escalated';
      return;
    }

    if (
      (lower.includes('book') || lower.includes('schedule') || lower.includes('confirm')) &&
      conversation.leadInfo?.email &&
      conversation.status === 'active'
    ) {
      conversation.status = 'qualified';
    }
  }

  private static buildSystemPrompt(profile: IProfile): string {
    const { aiConfig, displayName, title, company } = profile;

    return `You are an AI secretary for ${displayName}, ${title} at ${company}.

Your goals:
1. Greet visitors warmly and professionally.
2. Collect their name, company, and reason for contacting.
3. Qualify them by asking: ${aiConfig.qualificationQuestions.join(', ')}.
4. If qualified, propose scheduling a meeting and collect their email.
5. If you cannot help or the visitor is frustrated, escalate to a human.

Rules:
- Be concise (2–3 sentences max per response).
- Ask one question at a time.
- Never invent meeting times; only suggest times you've confirmed.
- Always confirm details before committing to anything.
- Personality style: ${aiConfig.personality}.
- Opening greeting: "${aiConfig.greeting}"`;
  }

  static async getConversation(
    profileId: string,
    sessionId: string
  ): Promise<IConversation | null> {
    return Conversation.findOne({ profileId, visitorId: sessionId });
  }
}
