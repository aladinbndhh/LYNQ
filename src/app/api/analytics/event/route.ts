import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { Profile } from '@/lib/db/models';
import {
  successResponse,
  errorResponse,
  parseRequestBody,
  getClientIp,
} from '@/lib/utils/api';

// POST /api/analytics/event - Track analytics event (public endpoint)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await parseRequestBody<{
      profileId: string;
      eventType: 'view' | 'qr_scan' | 'nfc_scan' | 'chat_start' | 'chat_qualified' | 'meeting_booked';
      metadata?: object;
    }>(request);

    if (!body?.profileId || !body?.eventType) {
      return errorResponse('ProfileId and eventType are required');
    }

    // Get profile to get tenantId
    const profile = await Profile.findById(body.profileId);
    if (!profile) {
      return errorResponse('Profile not found', 404);
    }

    // Track event
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;

    await AnalyticsService.trackEvent({
      tenantId: profile.tenantId,
      profileId: profile._id,
      eventType: body.eventType,
      metadata: body.metadata,
      ipAddress,
      userAgent,
      referrer,
    });

    return successResponse({ tracked: true });
  } catch (error: any) {
    console.error('Analytics tracking error:', error);
    return errorResponse(error.message || 'Failed to track event', 500);
  }
}
