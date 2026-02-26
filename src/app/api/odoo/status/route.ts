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

// GET /api/odoo/status - Get Odoo connection status
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const status = await OdooService.getConnectionStatus(tenantContext);

    return successResponse(status);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to get Odoo status', 500);
  }
}
