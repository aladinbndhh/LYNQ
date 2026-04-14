import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { requireAdmin } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import { OdooService } from '@/lib/services/odoo.service';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/utils/api';

// GET /api/odoo/employees - List lynq.profile records from connected Odoo instance
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAdmin(request);
    const ctx = createTenantContext(session);

    const employees = await OdooService.getOdooEmployees(ctx.tenantId);
    return successResponse(employees);
  } catch (e: any) {
    if (e?.message === 'Unauthorized') return unauthorizedResponse();
    if (e?.message?.includes('Forbidden')) return forbiddenResponse();
    if (e?.message === 'Odoo not connected') {
      return errorResponse('Odoo is not connected for this organisation', 400);
    }
    return errorResponse(e?.message || 'Failed to fetch Odoo employees', 500);
  }
}
