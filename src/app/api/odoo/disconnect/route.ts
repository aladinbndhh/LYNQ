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

// DELETE /api/odoo/disconnect - Disconnect from Odoo
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    await OdooService.disconnectOdoo(tenantContext);

    return successResponse(
      { disconnected: true },
      'Disconnected from Odoo successfully'
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to disconnect from Odoo', 500);
  }
}
