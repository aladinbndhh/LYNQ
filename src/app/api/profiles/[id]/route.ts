import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OdooProfileService } from '@/lib/services/odoo-profile.service';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '@/lib/utils/api';

// GET /api/profiles/:id - Get profile by ID from Odoo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    // Get Odoo credentials from session
    const odooEmail = session.user.email;
    const odooPassword = (session as any).odooPassword;
    
    if (!odooPassword) {
      return errorResponse('Odoo credentials not found in session', 401);
    }

    const profile = await OdooProfileService.getProfileById(
      odooEmail,
      odooPassword,
      parseInt(id)
    );

    if (!profile) {
      return notFoundResponse('Profile not found');
    }

    return successResponse(profile);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to fetch profile', 500);
  }
}

// PUT /api/profiles/:id - NOT ALLOWED (profiles updated in Odoo only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return errorResponse('Profiles must be updated in Odoo. This endpoint is read-only.', 405);
}

// DELETE /api/profiles/:id - NOT ALLOWED (profiles deleted in Odoo only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return errorResponse('Profiles must be deleted in Odoo. This endpoint is read-only.', 405);
}
