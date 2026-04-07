import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { OrgAdminService } from '@/lib/services/org-admin.service';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await connectDB();
    const { token } = await params;
    if (!token) return notFoundResponse();

    const inv = await OrgAdminService.getInvitationByToken(token);
    if (!inv) return notFoundResponse('Invalid or expired invitation');

    const tenant = inv.tenantId as unknown as { name?: string; subdomain?: string };
    return successResponse({
      email: inv.email,
      role: inv.role,
      organisationName: tenant?.name ?? 'Organisation',
      subdomain: tenant?.subdomain ?? null,
    });
  } catch (e: any) {
    return errorResponse(e?.message || 'Failed', 500);
  }
}
