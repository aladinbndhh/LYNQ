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
} from '@/lib/utils/api';

function handleErr(e: any) {
  if (e?.message === 'Unauthorized') return unauthorizedResponse();
  if (e?.message?.includes('Forbidden')) return forbiddenResponse();
  return errorResponse(e?.message || 'Request failed', 500);
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
    if (!Types.ObjectId.isValid(id)) return errorResponse('Invalid id', 400);

    await OrgAdminService.cancelInvitation(ctx.tenantId, new Types.ObjectId(id));
    return successResponse({ ok: true });
  } catch (e: any) {
    if (e?.message?.includes('not found')) return errorResponse(e.message, 404);
    return handleErr(e);
  }
}
