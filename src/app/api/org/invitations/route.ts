import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/db/connection';
import { requireAdmin } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import { OrgAdminService } from '@/lib/services/org-admin.service';
import { sendOrgInvitationEmail } from '@/lib/email';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  errorResponse,
  parseRequestBody,
} from '@/lib/utils/api';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lynq.cards';

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
    const list = await OrgAdminService.listInvitations(ctx.tenantId);
    return successResponse(list);
  } catch (e: any) {
    return handleErr(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAdmin(request);
    const ctx = createTenantContext(session);
    const body = await parseRequestBody<{
      email: string;
      role?: 'admin' | 'user';
      odooProfileId?: number;
    }>(request);
    if (!body?.email) return errorResponse('email is required', 400);

    const tenant = await OrgAdminService.getTenant(ctx.tenantId);
    const inv = await OrgAdminService.createInvitation(
      ctx.tenantId,
      body.email,
      body.role === 'admin' ? 'admin' : 'user',
      new Types.ObjectId(session.id),
      body.odooProfileId ? Number(body.odooProfileId) : undefined
    );

    const inviteUrl = `${APP_URL}/invite/${inv.token}`;
    const roleLabel = inv.role === 'admin' ? 'Administrator' : 'Member';

    await sendOrgInvitationEmail(inv.email, tenant.name, roleLabel, inviteUrl).catch(console.error);

    return successResponse(
      { id: inv._id.toString(), email: inv.email, expiresAt: inv.expiresAt },
      'Invitation sent'
    );
  } catch (e: any) {
    if (
      e?.message?.includes('already') ||
      e?.message?.includes('pending') ||
      e?.message?.includes('account')
    ) {
      return errorResponse(e.message, 400);
    }
    return handleErr(e);
  }
}
