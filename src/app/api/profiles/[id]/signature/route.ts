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

    const signatureHtml = `<table cellpadding="0" cellspacing="0" border="0" id="copy-signature" style="position:static;z-index:-1000;top:0px;width:460px;left:0px;border:1.3px solid rgb(242,242,242);box-sizing:border-box;border-radius:0px;box-shadow:none;font-family:Arial,sans-serif;">
  <tbody>
    <tr>
      <td style="width:210px;padding:20px 0px 0px 20px;">
        <table id="leftSideTable" style="max-width:210px;width:100%;">
          <tbody>
            <tr>
              <td>
                <table><tbody><tr>
                  <td style="padding:0px;display:table-cell;line-height:1.2 !important;">
                    <table style="border-spacing:0;border-collapse:collapse;"><tbody><tr>
                      <td style="padding:0px;vertical-align:middle;">
                        ${avatarUrl ? `<img alt="" width="120" src="${avatarUrl}" style="width:120px;height:120px;border-radius:50%;display:block;">` : `<div style="width:120px;height:120px;border-radius:50%;background-color:${primaryColor};display:flex;align-items:center;justify-content:center;color:white;font-size:48px;font-weight:bold;font-family:Arial,sans-serif;">${getInitials(profile.displayName)}</div>`}
                      </td>
                      ${profile.company ? `<td style="padding:0px 0px 0px 10px;vertical-align:middle;"><div style="width:48px;height:48px;border-radius:50%;background-color:#ffffff;border:2px solid #ffffff;padding:2px;box-shadow:0 2px 4px rgba(0,0,0,0.1);position:relative;">${logoUrl ? `<img src="${logoUrl}" alt="${profile.company}" style="width:100%;height:100%;border-radius:50%;object-fit:contain;display:block;">` : `<div style="width:100%;height:100%;border-radius:50%;background-color:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#6b7280;font-size:14px;font-weight:600;font-family:Arial,sans-serif;">${profile.company.charAt(0).toUpperCase()}</div>`}</div></td>` : ''}
                    </tr></tbody></table>
                  </td>
                </tr></tbody></table>
              </td>
            </tr>
            <tr style="padding:0px;margin:0px;">
              <td style="font-size:18px;font-weight:600;padding:0px;margin:0px;line-height:1.2 !important;">
                <span style="font-size:18px;font-weight:600;text-overflow:ellipsis;display:block;white-space:nowrap;overflow:hidden;font-family:Arial,sans-serif;">${profile.displayName}</span>
              </td>
            </tr>
            <tr><td style="font-size:12px;font-weight:400;color:rgb(79,79,79);padding:0px;line-height:15px !important;"><span style="font-family:Arial,sans-serif;">${profile.title || ''}</span></td></tr>
            <tr><td style="font-size:12px;font-weight:400;color:rgb(79,79,79);padding:0px;line-height:15px !important;"><span style="font-family:Arial,sans-serif;">${profile.company || ''}</span></td></tr>
            ${profile.contactInfo?.phone ? `<tr><td style="font-size:12px;color:rgb(130,130,130);padding:0px;height:16px;line-height:15px !important;"><span style="font-family:Arial,sans-serif;">${profile.contactInfo.phone}</span></td></tr>` : ''}
            <tr>
              <td colspan="2" style="padding-top:8px;padding-bottom:20px;min-width:166px;vertical-align:middle;height:20px;">
                <table style="border-collapse:collapse;"><tbody><tr>${contactIcons.join('')}</tr></tbody></table>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
      <td style="padding:0px;line-height:1.2 !important;"></td>
      <td align="center" style="padding:20px 20px 0px 40px;vertical-align:top;">
        <table style="width:180px;">
          <tbody>
            <tr><td style="text-align:center;padding-bottom:8px;padding-top:5px;"><span style="font-size:12px;font-weight:500;color:rgb(130,130,130);display:block;font-family:Arial,sans-serif;">Connect with me</span></td></tr>
            <tr>
              <td style="text-align:center;margin:0px auto;height:190px;vertical-align:middle;line-height:1.2 !important;">
                ${qrCodeUrl ? `<img width="172" height="190" alt="QR Code" src="${qrCodeUrl}" style="width:172px;height:190px;display:block;margin:0 auto;">` : `<div style="width:172px;height:190px;background-color:#f9fafb;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-family:Arial,sans-serif;font-size:11px;margin:0 auto;">QR Code</div>`}
              </td>
            </tr>
            <tr>
              <td style="text-align:center;padding-top:8px;padding-bottom:20px;">
                <a href="${contactUrl}" target="_blank" rel="noreferrer" style="font-size:12px;text-align:center;text-decoration:none;font-weight:400;color:${primaryColor};display:block;">My Digital Business Card</a>
              </td>
            </tr>
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
