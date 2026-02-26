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

// GET /api/calendar/availability/:profileId - Get available time slots
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    await connectDB();
    const { profileId } = await params;
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const duration = searchParams.get('duration');
    const timezone = searchParams.get('timezone');

    if (!date) {
      return errorResponse('Date parameter is required (YYYY-MM-DD format)');
    }

    const slots = await CalendarService.getAvailability({
      profileId,
      date,
      duration: duration ? parseInt(duration) : undefined,
      timezone: timezone || undefined,
      tenantContext,
    });

    return successResponse({ slots });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to fetch availability', 500);
  }
}
