import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { Tenant } from '@/lib/db/models';
import { requireAuth } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/api';

// DELETE /api/calendar/google/disconnect - Disconnect Google Calendar
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    // Remove Google calendar integration
    await Tenant.findByIdAndUpdate(tenantContext.tenantId, {
      $pull: {
        calendarIntegrations: { provider: 'google' },
      },
    });

    return successResponse({ disconnected: true }, 'Google Calendar disconnected successfully');
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to disconnect', 500);
  }
}
