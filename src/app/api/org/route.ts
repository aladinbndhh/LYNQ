import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { requireAuth, requireAdmin } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import { OrgAdminService } from '@/lib/services/org-admin.service';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  parseRequestBody,
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
    const tenant = await OrgAdminService.getTenant(ctx.tenantId);
    return successResponse({
      id: tenant._id.toString(),
      name: tenant.name,
      email: tenant.email,
      subdomain: tenant.subdomain ?? null,
      subscriptionTier: tenant.subscriptionTier,
      userCount: tenant.userCount,
    });
  } catch (e: any) {
    return handleErr(e);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAdmin(request);
    const ctx = createTenantContext(session);
    const body = await parseRequestBody<{ name?: string; subdomain?: string | null }>(request);
    if (!body) return errorResponse('Invalid body', 400);

    const tenant = await OrgAdminService.updateTenant(ctx.tenantId, {
      name: body.name,
      subdomain: body.subdomain,
    });

    return successResponse({
      id: tenant._id.toString(),
      name: tenant.name,
      subdomain: tenant.subdomain ?? null,
    });
  } catch (e: any) {
    if (e?.message?.includes('taken') || e?.message?.includes('Invalid')) {
      return errorResponse(e.message, 400);
    }
    return handleErr(e);
  }
}
