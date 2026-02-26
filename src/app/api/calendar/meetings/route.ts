import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { CalendarService } from '@/lib/services/calendar.service';
import { requireAuth } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/utils/api';

// GET /api/calendar/meetings - List meetings
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const leadId = searchParams.get('leadId');
    const status = searchParams.get('status');

    const meetings = await CalendarService.listMeetings(tenantContext, {
      profileId: profileId || undefined,
      leadId: leadId || undefined,
      status: status || undefined,
    });

    return successResponse(meetings);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to fetch meetings', 500);
  }
}
