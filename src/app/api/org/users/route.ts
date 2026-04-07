import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { requireAdmin } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import { OrgAdminService } from '@/lib/services/org-admin.service';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  errorResponse,
} from '@/lib/utils/api';

function handleErr(e: any) {
  if (e?.message === 'Unauthorized') return unauthorizedResponse();
  if (e?.message?.includes('Forbidden')) return forbiddenResponse();
  return errorResponse(e?.message || 'Request failed', 500);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAdmin(request);
    const ctx = createTenantContext(session);
    const users = await OrgAdminService.listUsers(ctx.tenantId);
    return successResponse(users);
  } catch (e: any) {
    return handleErr(e);
  }
}
