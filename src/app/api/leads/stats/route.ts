import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OdooLeadService } from '@/lib/services/odoo-lead.service';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/utils/api';

// GET /api/leads/stats - Get lead statistics from Odoo
export async function GET(request: NextRequest) {
  try {
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
    
    const stats = await OdooLeadService.getLeadStats(odooEmail, odooPassword);

    return successResponse(stats);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to fetch lead stats', 500);
  }
}
