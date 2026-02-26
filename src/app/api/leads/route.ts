import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OdooLeadService } from '@/lib/services/odoo-lead.service';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/utils/api';

// GET /api/leads - List all leads from Odoo
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const status = searchParams.get('status');
    const source = searchParams.get('source');

    // Get Odoo credentials from session
    const odooEmail = session.user.email;
    const odooPassword = (session as any).odooPassword;
    
    if (!odooPassword) {
      return errorResponse('Odoo credentials not found in session', 401);
    }
    
    const leads = await OdooLeadService.listLeads(odooEmail, odooPassword, {
      profileId: profileId ? parseInt(profileId) : undefined,
      status: status || undefined,
      source: source || undefined,
    });

    return successResponse(leads);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to fetch leads', 500);
  }
}

// POST /api/leads - NOT ALLOWED (leads created in Odoo only)
export async function POST(request: NextRequest) {
  return errorResponse('Leads must be created in Odoo. This endpoint is read-only.', 405);
}
