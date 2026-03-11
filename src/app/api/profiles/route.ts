import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { ProfileService } from '@/lib/services/profile.service';
import { requireAuth } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import { IProfile } from '@/types';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  parseRequestBody,
} from '@/lib/utils/api';

// GET /api/profiles - List all profiles for current tenant
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const profiles = await ProfileService.listProfiles(tenantContext);
    return successResponse(profiles);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    return errorResponse(error.message || 'Failed to fetch profiles', 500);
  }
}

// POST /api/profiles - Create a new profile
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const body = await parseRequestBody<Partial<IProfile>>(request);
    if (!body?.username || !body?.displayName) {
      return errorResponse('username and displayName are required', 400);
    }

    const profile = await ProfileService.createProfile(body, tenantContext);
    return successResponse(profile, 'Profile created successfully');
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    if (error.message === 'Username already taken') return errorResponse(error.message, 409);
    return errorResponse(error.message || 'Failed to create profile', 500);
  }
}
