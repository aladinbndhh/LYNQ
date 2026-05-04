import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { ProfileService } from '@/lib/services/profile.service';
import { requireAuth } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '@/lib/utils/api';

// GET /api/profiles/:id/signature - Generate email signature HTML from MongoDB profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const profile = await ProfileService.getProfileById(id, tenantContext);
    if (!profile) return notFoundResponse('Profile not found');

    const getInitials = (name: string) =>
      name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    const primaryColor = profile.branding?.primaryColor || '#3b82f6';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const contactUrl = `${appUrl}/${profile.username}`;

    const avatarUrl = profile.avatar || null;
    const logoUrl = profile.branding?.logo || null;
    const qrCodeUrl = profile.qrCode || null;

    const contactIcons: string[] = [];
    if (profile.contactInfo?.phone) {
      contactIcons.push(`<td style="padding:2px 6px 0px 0px;display:table-cell;"><a href="tel:${profile.contactInfo.phone}" style="display:inline-block;width:20px;height:20px;"><img alt="Phone" width="20" height="20" src="https://dash.popl.co/assets/img/new-links/call.png" style="width:20px;height:20px;border:0px;border-radius:4px;"></a></td>`);
    }
    if (profile.contactInfo?.email) {
      contactIcons.push(`<td style="padding:2px 6px 0px 0px;display:table-cell;"><a href="mailto:${profile.contactInfo.email}" style="display:inline-block;width:20px;height:20px;"><img alt="Email" width="20" height="20" src="https://dash.popl.co/assets/img/new-links/email.png" style="width:20px;height:20px;border:0px;border-radius:4px;"></a></td>`);
    }
    if (profile.contactInfo?.linkedin) {
      contactIcons.push(`<td style="padding:2px 6px 0px 0px;display:table-cell;"><a href="${profile.contactInfo.linkedin}" style="display:inline-block;width:20px;height:20px;"><img alt="LinkedIn" width="20" height="20" src="https://img.icons8.com/color/20/000000/linkedin.png" style="width:20px;height:20px;border:0px;border-radius:4px;"></a></td>`);
    }
    if (profile.contactInfo?.twitter) {
      contactIcons.push(`<td style="padding:2px 6px 0px 0px;display:table-cell;"><a href="${profile.contactInfo.twitter}" style="display:inline-block;width:20px;height:20px;"><img alt="Twitter" width="20" height="20" src="https://img.icons8.com/color/20/000000/twitter.png" style="width:20px;height:20px;border:0px;border-radius:4px;"></a></td>`);
    }
    contactIcons.push(`<td style="padding:2px 6px 0px 0px;display:table-cell;"><a href="${contactUrl}" style="display:inline-block;width:20px;height:20px;"><img alt="Website" width="20" height="20" src="https://dash.popl.co/assets/img/new-links/website.png" style="width:20px;height:20px;border:0px;border-radius:4px;"></a></td>`);

    const contactIconsRow =
      contactIcons.length > 0
        ? `<tr><td style="padding-top:10px;padding-bottom:4px;"><table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tbody><tr>${contactIcons.join('')}</tr></tbody></table></td></tr>`
        : '';

    const avatarImg = avatarUrl
      ? `<img alt="" width="120" height="120" src="${avatarUrl}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;display:block;">`
      : `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td width="120" height="120" align="center" valign="middle" style="width:120px;height:120px;border-radius:50%;background-color:${primaryColor};color:#ffffff;font-size:40px;font-weight:700;font-family:Arial,sans-serif;line-height:120px;">${getInitials(profile.displayName)}</td></tr></table>`;

    const showBadge = Boolean(logoUrl || profile.company);
    const badgeInner = logoUrl
      ? `<img src="${logoUrl}" alt="${profile.company || 'Company'}" width="40" height="40" style="width:40px;height:40px;border-radius:50%;object-fit:contain;display:block;">`
      : profile.company
        ? `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td width="40" height="40" align="center" valign="middle" style="width:40px;height:40px;border-radius:50%;background-color:#f3f4f6;color:#6b7280;font-size:14px;font-weight:600;font-family:Arial,sans-serif;line-height:40px;">${profile.company.charAt(0).toUpperCase()}</td></tr></table>`
        : '';

    const avatarWithBadge =
      showBadge && badgeInner
        ? `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td style="padding:0;line-height:0;font-size:0;">${avatarImg}</td></tr><tr><td align="right" valign="top" style="padding:0;line-height:0;font-size:0;"><table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:-28px;margin-right:2px;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td style="padding:3px;background:#ffffff;border-radius:50%;">${badgeInner}</td></tr></table></td></tr></table>`
        : avatarImg;

    const signatureHtml = `<table cellpadding="0" cellspacing="0" border="0" id="copy-signature" style="width:460px;max-width:460px;border-collapse:separate;border-spacing:0;background:#ffffff;border:1px solid #f2f2f2;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,0.07);font-family:Arial,Helvetica,sans-serif;box-sizing:border-box;">
  <tbody>
    <tr>
      <td style="width:210px;padding:20px 8px 20px 20px;vertical-align:top;">
        <table cellpadding="0" cellspacing="0" border="0" id="leftSideTable" style="max-width:210px;width:100%;border-collapse:collapse;">
          <tbody>
            <tr><td style="padding:0 0 4px 0;line-height:0;">${avatarWithBadge}</td></tr>
            <tr><td style="font-size:18px;font-weight:600;color:#111111;padding:8px 0 0 0;margin:0;line-height:1.2;font-family:Arial,sans-serif;"><span style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:190px;">${profile.displayName}</span></td></tr>
            <tr><td style="font-size:12px;font-weight:400;color:#4f4f4f;padding:0;line-height:15px;font-family:Arial,sans-serif;"><span style="font-size:12px;color:#4f4f4f;line-height:15px;">${profile.title || ''}</span></td></tr>
            <tr><td style="font-size:12px;font-weight:400;color:#4f4f4f;padding:0;line-height:15px;font-family:Arial,sans-serif;"><span style="font-size:12px;color:#4f4f4f;line-height:15px;">${profile.company || ''}</span></td></tr>
            ${profile.contactInfo?.phone ? `<tr><td style="font-size:12px;font-weight:400;color:#828282;padding:10px 0 0 0;line-height:15px;height:16px;font-family:Arial,sans-serif;"><span>${profile.contactInfo.phone}</span></td></tr>` : ''}
            ${contactIconsRow}
            <tr><td style="padding-bottom:0;font-size:0;line-height:0;">&nbsp;</td></tr>
          </tbody>
        </table>
      </td>
      <td style="padding:0;width:8px;font-size:0;line-height:0;">&nbsp;</td>
      <td align="center" style="padding:20px 20px 20px 32px;vertical-align:top;">
        <table cellpadding="0" cellspacing="0" border="0" style="width:180px;border-collapse:collapse;margin:0 auto;">
          <tbody>
            <tr><td style="text-align:center;padding:5px 0 8px 0;"><span style="font-size:12px;font-weight:500;color:#828282;display:block;font-family:Arial,sans-serif;">Connect with me</span></td></tr>
            <tr><td style="text-align:center;padding:0;line-height:0;">${
              qrCodeUrl
                ? `<img width="172" height="172" alt="QR Code" src="${qrCodeUrl}" style="width:172px;height:auto;max-height:190px;display:block;margin:0 auto;border:0;">`
                : `<table cellpadding="0" cellspacing="0" border="0" style="width:172px;margin:0 auto;border-collapse:collapse;"><tr><td width="172" height="172" align="center" valign="middle" style="width:172px;height:172px;background-color:#f9fafb;border:1px solid #e5e7eb;color:#9ca3af;font-family:Arial,sans-serif;font-size:11px;">QR Code</td></tr></table>`
            }</td></tr>
            <tr><td style="text-align:center;padding:8px 0 0 0;"><a href="${contactUrl}" target="_blank" rel="noreferrer" style="font-size:12px;text-align:center;text-decoration:underline;font-weight:400;color:${primaryColor};display:block;font-family:Arial,sans-serif;">My Digital Business Card</a></td></tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>`;

    return successResponse({ html: signatureHtml });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    return errorResponse(error.message || 'Failed to generate signature', 500);
  }
}
