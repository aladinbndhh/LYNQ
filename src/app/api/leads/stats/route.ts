import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { LeadService } from '@/lib/services/lead.service';
import { requireAuth } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/utils/api';

// GET /api/leads/stats - Get lead statistics from MongoDB
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const stats = await LeadService.getLeadStats(tenantContext);
    return successResponse(stats);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    return errorResponse(error.message || 'Failed to fetch lead stats', 500);
  }
}
