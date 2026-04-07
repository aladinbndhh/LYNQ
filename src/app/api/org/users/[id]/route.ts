import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/db/connection';
import { requireAdmin } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import { OrgAdminService } from '@/lib/services/org-admin.service';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  errorResponse,
  parseRequestBody,
} from '@/lib/utils/api';

function handleErr(e: any) {
  if (e?.message === 'Unauthorized') return unauthorizedResponse();
  if (e?.message?.includes('Forbidden')) return forbiddenResponse();
  return errorResponse(e?.message || 'Request failed', 500);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await requireAdmin(request);
    const ctx = createTenantContext(session);
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse('Invalid user id', 400);

    const body = await parseRequestBody<{ role: 'admin' | 'user' }>(request);
    if (!body?.role) return errorResponse('role is required', 400);

    const user = await OrgAdminService.updateUserRole(
      ctx.tenantId,
      new Types.ObjectId(id),
      body.role,
      session.id
    );
    return successResponse(user);
  } catch (e: any) {
    if (e?.message?.includes('last')) return errorResponse(e.message, 400);
    return handleErr(e);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await requireAdmin(request);
    const ctx = createTenantContext(session);
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse('Invalid user id', 400);

    await OrgAdminService.removeUser(ctx.tenantId, new Types.ObjectId(id), session.id);
    return successResponse({ ok: true });
  } catch (e: any) {
    if (e?.message?.includes('last') || e?.message?.includes('yourself')) {
      return errorResponse(e.message, 400);
    }
    return handleErr(e);
  }
}
