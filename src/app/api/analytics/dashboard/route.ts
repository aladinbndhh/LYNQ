import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { requireAuth } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/utils/api';

// GET /api/analytics/dashboard - Get analytics dashboard data
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return errorResponse('ProfileId query parameter is required');
    }

    const analytics = await AnalyticsService.getProfileAnalytics(profileId);

    return successResponse(analytics);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to fetch analytics', 500);
  }
}
