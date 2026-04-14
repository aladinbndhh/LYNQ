import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { OrgAdminService } from '@/lib/services/org-admin.service';
import { OdooService } from '@/lib/services/odoo.service';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/api';
import { Types } from 'mongoose';

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

    let odooProfile: {
      name: string;
      title?: string;
      department?: string;
      company?: string;
      avatar?: string;
      logo?: string;
      phone?: string;
    } | null = null;

    // Fetch Odoo employee data for pre-filling the accept form
    if (inv.odooProfileId) {
      try {
        const tenantId = new Types.ObjectId(
          (inv as any).tenantId?._id?.toString() || (inv as any).tenantId?.toString()
        );
        const op = await OdooService.getOdooProfileForInvite(tenantId, inv.odooProfileId);
        if (op) {
          odooProfile = {
            name: op.name,
            title: op.title,
            department: op.department,
            company: op.company,
            avatar: op.avatar,
            logo: op.logo,
            phone: op.phone,
          };
        }
      } catch {
        // Non-critical — don't fail the invite page load
      }
    }

    return successResponse({
      email: inv.email,
      role: inv.role,
      organisationName: tenant?.name ?? 'Organisation',
      subdomain: tenant?.subdomain ?? null,
      odooProfile,
    });
  } catch (e: any) {
    return errorResponse(e?.message || 'Failed', 500);
  }
}
