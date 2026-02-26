import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { ProfileService } from '@/lib/services/profile.service';
import { successResponse, errorResponse } from '@/lib/utils/api';

// GET /api/profiles/check-username?username=xxx - Check if username is available
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return errorResponse('Username parameter is required');
    }

    const available = await ProfileService.isUsernameAvailable(username);

    return successResponse({ available, username });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to check username', 500);
  }
}
