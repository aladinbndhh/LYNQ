import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { CalendarService } from '@/lib/services/calendar.service';
import { requireAuth } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  parseRequestBody,
} from '@/lib/utils/api';

interface BookMeetingBody {
  profileId: string;
  leadId?: string;
  conversationId?: string;
  title?: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  attendees: Array<{ name: string; email: string }>;
  location?: string;
}

// POST /api/calendar/book - Book a meeting
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const body = await parseRequestBody<BookMeetingBody>(request);

    if (!body?.profileId || !body?.startTime || !body?.endTime || !body?.attendees) {
      return errorResponse('ProfileId, startTime, endTime, and attendees are required');
    }

    const meeting = await CalendarService.bookMeeting(
      {
        profileId: body.profileId,
        leadId: body.leadId,
        conversationId: body.conversationId,
        title: body.title || 'Meeting',
        description: body.description,
        startTime: body.startTime,
        endTime: body.endTime,
        timezone: body.timezone || 'UTC',
        attendees: body.attendees,
        location: body.location,
      },
      tenantContext
    );

    return successResponse(meeting, 'Meeting booked successfully');
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to book meeting', 500);
  }
}
