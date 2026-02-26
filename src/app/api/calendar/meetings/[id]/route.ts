import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { CalendarService } from '@/lib/services/calendar.service';
import { requireAuth } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '@/lib/utils/api';

// DELETE /api/calendar/meetings/:id - Cancel meeting
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const meeting = await CalendarService.cancelMeeting(id, tenantContext);

    if (!meeting) {
      return notFoundResponse('Meeting not found');
    }

    return successResponse(meeting, 'Meeting cancelled successfully');
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to cancel meeting', 500);
  }
}
