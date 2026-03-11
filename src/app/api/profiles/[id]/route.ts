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
  notFoundResponse,
  parseRequestBody,
} from '@/lib/utils/api';

// GET /api/profiles/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const profile = await ProfileService.getProfileById(id, tenantContext);
    if (!profile) return notFoundResponse('Profile not found');

    return successResponse(profile);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    return errorResponse(error.message || 'Failed to fetch profile', 500);
  }
}

// PUT /api/profiles/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const body = await parseRequestBody<Partial<IProfile>>(request);
    if (!body) return errorResponse('Invalid request body', 400);

    const profile = await ProfileService.updateProfile(id, body, tenantContext);
    if (!profile) return notFoundResponse('Profile not found');

    return successResponse(profile, 'Profile updated successfully');
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    if (error.message === 'Username already taken') return errorResponse(error.message, 409);
    return errorResponse(error.message || 'Failed to update profile', 500);
  }
}

// DELETE /api/profiles/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const deleted = await ProfileService.deleteProfile(id, tenantContext);
    if (!deleted) return notFoundResponse('Profile not found');

    return successResponse({ deleted: true }, 'Profile deleted successfully');
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    return errorResponse(error.message || 'Failed to delete profile', 500);
  }
}
