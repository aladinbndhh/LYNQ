import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { Tenant } from '@/lib/db/models';
import { getGoogleTokens } from '@/lib/integrations/google-calendar';
import { requireAuth } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  parseRequestBody,
} from '@/lib/utils/api';

// POST /api/calendar/google/callback - Handle Google OAuth callback
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const body = await parseRequestBody<{ code: string }>(request);

    if (!body?.code) {
      return errorResponse('Authorization code is required');
    }

    // Exchange code for tokens
    const tokens = await getGoogleTokens(body.code);

    if (!tokens.access_token) {
      return errorResponse('Failed to get access token');
    }

    // Save tokens to tenant
    await Tenant.findByIdAndUpdate(tenantContext.tenantId, {
      $push: {
        calendarIntegrations: {
          provider: 'google',
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || '',
          expiresAt: new Date(Date.now() + (tokens.expiry_date || 3600 * 1000)),
        },
      },
    });

    return successResponse(
      { connected: true, email: tokens.scope },
      'Google Calendar connected successfully'
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Google OAuth callback error:', error);
    return errorResponse(error.message || 'Failed to connect Google Calendar', 500);
  }
}
