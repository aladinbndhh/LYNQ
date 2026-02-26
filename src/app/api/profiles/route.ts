import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OdooProfileService } from '@/lib/services/odoo-profile.service';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/utils/api';

// GET /api/profiles - List all profiles for current user from Odoo
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return unauthorizedResponse();
    }
    
    // Get Odoo credentials from session
    const odooUserId = (session.user as any).odooUserId || parseInt(session.user.id);
    const odooEmail = session.user.email;
    const odooPassword = (session as any).odooPassword;
    
    if (!odooPassword) {
      return errorResponse('Odoo credentials not found in session', 401);
    }

    const profiles = await OdooProfileService.listProfiles(
      odooEmail,
      odooPassword,
      odooUserId
    );

    return successResponse(profiles);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to fetch profiles', 500);
  }
}

// POST /api/profiles - NOT ALLOWED (profiles created in Odoo only)
export async function POST(request: NextRequest) {
  return errorResponse('Profiles must be created in Odoo. This endpoint is read-only.', 405);
}
