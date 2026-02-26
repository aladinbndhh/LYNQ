import { NextRequest } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/integrations/google-calendar';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/api';

// GET /api/calendar/google/auth - Get Google OAuth URL
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const authUrl = getGoogleAuthUrl();

    return successResponse({ authUrl });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to generate auth URL', 500);
  }
}
