import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { OdooService } from '@/lib/services/odoo.service';
import { requireAuth } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  parseRequestBody,
} from '@/lib/utils/api';

// POST /api/odoo/connect - Connect to Odoo
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const body = await parseRequestBody<{
      url: string;
      database: string;
      username: string;
      password: string;
    }>(request);

    if (!body?.url || !body?.database || !body?.username || !body?.password) {
      return errorResponse('All Odoo connection fields are required');
    }

    await OdooService.connectOdoo(tenantContext, body);

    return successResponse({ connected: true }, 'Connected to Odoo successfully');
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to connect to Odoo', 500);
  }
}
