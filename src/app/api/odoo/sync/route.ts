import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { OdooService } from '@/lib/services/odoo.service';
import { requireAuth } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/utils/api';

// POST /api/odoo/sync - Sync all leads to Odoo
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const results = await OdooService.syncAllLeadsToOdoo(tenantContext);

    return successResponse(results, 'Sync completed');
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to sync with Odoo', 500);
  }
}
