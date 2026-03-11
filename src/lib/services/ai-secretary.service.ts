import { callOpenRouter, AI_TEMPERATURE, ChatMessage } from '@/lib/integrations/openai';
import { Conversation, Profile } from '@/lib/db/models';
import { IConversation, IProfile } from '@/types';
import { CalendarService } from './calendar.service';
import { LeadService } from './lead.service';
import { Types } from 'mongoose';
import { createTenantContext } from '@/lib/middleware/tenant';
import { addMinutes, format } from 'date-fns';

// ─── Structured action the model can embed in its reply ──────────────────────
interface BookMeetingAction {
  action: 'BOOK_MEETING';
  attendeeName: string;
  attendeeEmail: string;
  /** ISO 8601, e.g. "2026-03-15T10:00:00" */
  startTime: string;
  /** duration in minutes — used when endTime is not given */
  duration?: number;
  /** ISO 8601 — optional, calculated from duration if absent */
  endTime?: string;
  title?: string;
  notes?: string;
  timezone?: string;
}

type ParsedAction = BookMeetingAction | null;

/** Extract and strip a <LYNQ_ACTION>…</LYNQ_ACTION> block from the reply */
function extractAction(raw: string): { text: string; action: ParsedAction } {
  const match = raw.match(/<LYNQ_ACTION>([\s\S]*?)<\/LYNQ_ACTION>/);
  if (!match) return { text: raw.trim(), action: null };

  const text = raw.replace(match[0], '').trim();
  try {
    const parsed = JSON.parse(match[1].trim());
    if (parsed?.action === 'BOOK_MEETING') return { text, action: parsed as BookMeetingAction };
  } catch {
    console.warn('Could not parse LYNQ_ACTION JSON:', match[1]);
  }
  return { text, action: null };
}

export class AISecretaryService {
  static async chat(data: {
    profileId: string;
    sessionId: string;
    message: string;
    visitorInfo?: { name?: string; email?: string; company?: string };
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

    // Build OpenAI-style messages
    const systemPrompt = this.buildSystemPrompt(profile);
    const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }];

    for (const m of conversation.messages) {
      messages.push({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      });
    }
    messages.push({ role: 'user', content: data.message });

    // Save user message
    conversation.messages.push({ role: 'user', content: data.message, timestamp: new Date() });

    try {
      const rawReply = await callOpenRouter(messages, {
        temperature: AI_TEMPERATURE,
        max_tokens: 1000,
      });

      // Extract any structured action the model embedded
      const { text: assistantReply, action } = extractAction(rawReply);

      // Execute action if present
      if (action) {
        await this.executeAction(action, profile, conversation);
      } else {
        // Fallback keyword detection for status updates
        const lower = assistantReply.toLowerCase();
        if (lower.includes('escalat') || lower.includes('human agent')) {
          conversation.status = 'escalated';
        } else if (
          (lower.includes('book') || lower.includes('schedul') || lower.includes('confirm')) &&
          conversation.leadInfo?.email &&
          conversation.status === 'active'
        ) {
          conversation.status = 'qualified';
        }
      }

      conversation.messages.push({ role: 'assistant', content: assistantReply, timestamp: new Date() });
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

  /** Actually execute a BOOK_MEETING action emitted by the model */
  private static async executeAction(
    action: BookMeetingAction,
    profile: IProfile,
    conversation: IConversation
  ) {
    try {
      const tenant = profile.tenantId as any;
      const tenantId = (tenant._id || tenant).toString();

      const systemUser = { id: 'system', email: '', name: 'System', tenantId, role: 'admin' as const };
      const tenantContext = createTenantContext(systemUser);

      const profileId = profile._id?.toString() || profile.id?.toString();
      if (!profileId) throw new Error('Profile ID missing');

      // Derive endTime if absent
      const duration = action.duration ?? 30;
      const startDate = new Date(action.startTime);
      const endTime = action.endTime || format(addMinutes(startDate, duration), "yyyy-MM-dd'T'HH:mm:ss");
      const timezone = action.timezone || profile.timezone || 'UTC';

      // Upsert a lead record
      let leadId: string | undefined;
      if (action.attendeeEmail) {
        try {
          const profileObjId = new Types.ObjectId(profileId);
          const convObjId = conversation._id instanceof Types.ObjectId
            ? conversation._id
            : new Types.ObjectId(String(conversation._id));

          const lead = await LeadService.createLead(
            {
              profileId: profileObjId,
              conversationId: convObjId,
              name: action.attendeeName,
              email: action.attendeeEmail,
              source: 'chat',
              status: 'qualified',
            },
            tenantContext
          );
          leadId = lead._id?.toString();
        } catch (err) {
          console.warn('Lead creation failed (meeting still booked):', err);
        }
      }

      await CalendarService.bookMeeting(
        {
          profileId,
          leadId,
          conversationId: conversation._id?.toString(),
          title: action.title || `Meeting with ${action.attendeeName}`,
          description: action.notes,
          startTime: action.startTime,
          endTime,
          timezone,
          attendees: [{ name: action.attendeeName, email: action.attendeeEmail }],
        },
        tenantContext
      );

      conversation.status = 'booked';
      console.log(`Meeting booked for ${action.attendeeEmail} at ${action.startTime}`);
    } catch (err) {
      console.error('executeAction (BOOK_MEETING) failed:', err);
    }
  }

  private static buildSystemPrompt(profile: IProfile): string {
    const { aiConfig, displayName, title, company } = profile;
    const now = new Date();
    const todayStr = format(now, 'EEEE, MMMM d yyyy');

    return `You are an AI secretary for ${displayName}, ${title} at ${company}. Today is ${todayStr}.

Your goals:
1. Greet visitors warmly and professionally.
2. Collect their full name, email address, company, and purpose of meeting.
3. Qualify them by asking: ${aiConfig.qualificationQuestions.join(', ')}.
4. When the visitor confirms a specific date and time, book the meeting.
5. If you cannot help or the visitor requests a human, escalate.

Rules:
- Be concise (2–3 sentences per response). Ask one question at a time.
- Never confirm a booking without an email address and a specific date+time.
- Personality: ${aiConfig.personality}.
- Opening greeting: "${aiConfig.greeting}"

IMPORTANT — Booking:
When you have collected name, email, date, and time AND the visitor has confirmed, you MUST append this exact block at the END of your reply (replace values, keep the tags):

<LYNQ_ACTION>
{
  "action": "BOOK_MEETING",
  "attendeeName": "Visitor Full Name",
  "attendeeEmail": "visitor@example.com",
  "startTime": "YYYY-MM-DDTHH:MM:SS",
  "duration": 30,
  "title": "Meeting with ${displayName}",
  "notes": "optional notes",
  "timezone": "UTC"
}
</LYNQ_ACTION>

Only include this block once, only after explicit visitor confirmation.`;
  }

  static async getConversation(
    profileId: string,
    sessionId: string
  ): Promise<IConversation | null> {
    return Conversation.findOne({ profileId, visitorId: sessionId });
  }
}
