import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OdooProfileService } from '@/lib/services/odoo-profile.service';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '@/lib/utils/api';

// GET /api/profiles/:id/signature - Generate email signature HTML from Odoo profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    // Get Odoo credentials from session
    const odooEmail = session.user.email;
    const odooPassword = (session as any).odooPassword;
    
    if (!odooPassword) {
      return errorResponse('Odoo credentials not found in session', 401);
    }
    
    const profile = await OdooProfileService.getProfileById(
      odooEmail,
      odooPassword,
      parseInt(id)
    );

    if (!profile) {
      return notFoundResponse('Profile not found');
    }

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const primaryColor = profile.branding?.primaryColor || '#3b82f6';
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    
    // Get Odoo URL from environment (should be set to actual Odoo instance)
    const odooUrl = process.env.ODOO_URL || process.env.NEXT_PUBLIC_ODOO_URL || 'https://aladinbndhh-lynq-test-live-29061122.dev.odoo.com';

    const contactUrl = `${odooUrl}/lynq/contact/${profile.username}`;
    
    // Get address from partner if available (we'll need to fetch this from Odoo)
    // For now, we'll leave it empty or use a placeholder
    const address = ''; // TODO: Fetch from partner_id.street, city, country, etc.

    // Ensure avatar and logo use Odoo URLs
    const avatarUrl = profile.avatar 
      ? (profile.avatar.startsWith('http') ? profile.avatar : `${odooUrl}${profile.avatar.startsWith('/') ? '' : '/'}${profile.avatar}`)
      : null;
    
    // Always set logo URL if company exists - use the custom endpoint
    const logoUrl = profile.company 
      ? `${odooUrl}/lynq/image/profile/${profile.id}/company_logo`
      : null;
    const qrCodeUrl = profile.qrCode
      ? (profile.qrCode.startsWith('http') ? profile.qrCode : `${odooUrl}${profile.qrCode.startsWith('/') ? '' : '/'}${profile.qrCode}`)
      : null;

    // Build contact icons HTML (using image URLs - you may want to host these icons)
    const contactIcons = [];
    if (profile.contactInfo?.phone) {
      contactIcons.push(`<td style="padding:2px 6px 0px 0px;display:table-cell;"><a href="tel:${profile.contactInfo.phone}" style="display:inline-block;width:20px;height:20px;"><img alt="Phone number" width="20" height="20" src="https://dash.popl.co/assets/img/new-links/call.png" style="width:20px;height:20px;border:0px;border-radius:4px;"></a></td>`);
    }
    if (profile.contactInfo?.email) {
      contactIcons.push(`<td style="padding:2px 6px 0px 0px;display:table-cell;"><a href="mailto:${profile.contactInfo.email}" style="display:inline-block;width:20px;height:20px;"><img alt="email icon for mail" width="20" height="20" src="https://dash.popl.co/assets/img/new-links/email.png" style="width:20px;height:20px;border:0px;border-radius:4px;"></a></td>`);
    }
    contactIcons.push(`<td style="padding:2px 6px 0px 0px;display:table-cell;"><a href="${contactUrl}" style="display:inline-block;width:20px;height:20px;"><img alt="maps logo" width="20" height="20" src="https://dash.popl.co/assets/img/new-links/address.png" style="width:20px;height:20px;border:0px;border-radius:4px;"></a></td>`);
    contactIcons.push(`<td style="padding:2px 6px 0px 0px;display:table-cell;"><a href="${contactUrl}" style="display:inline-block;width:20px;height:20px;"><img alt="website logo in blue" width="20" height="20" src="https://dash.popl.co/assets/img/new-links/website.png" style="width:20px;height:20px;border:0px;border-radius:4px;"></a></td>`);

    const signatureHtml = `
<table cellpadding="0" cellspacing="0" border="0" id="copy-signature" style="position:static;z-index:-1000;top:0px;width:460px;left:0px;border:1.3px solid rgb(242,242,242);box-sizing:border-box;border-radius:0px;box-shadow:none;font-family:Arial,sans-serif;">
  <tbody>
    <tr>
      <td style="width:210px;padding:20px 0px 0px 20px;">
        <table id="leftSideTable" style="max-width:210px;width:100%;">
          <tbody>
            <tr>
              <td>
                <table>
                  <tbody>
                    <tr>
                      <td style="padding:0px;display:table-cell;line-height:1.2 !important;">
                        <table style="border-spacing:0;border-collapse:collapse;">
                          <tbody>
                            <tr>
                              <td style="padding:0px;vertical-align:middle;">
                                ${avatarUrl ? `
                                <img alt="" id="profile-pic-target" width="120" src="${avatarUrl}" style="width:120px;height:120px;border-radius:50%;display:block;">
                                ` : `
                                <div style="width:120px;height:120px;border-radius:50%;background-color:#2563eb;display:flex;align-items:center;justify-content:center;color:white;font-size:48px;font-weight:bold;font-family:Arial,sans-serif;">
                                  ${getInitials(profile.displayName)}
                                </div>
                                `}
                              </td>
                              ${profile.company ? `
                              <td style="padding:0px 0px 0px 10px;vertical-align:middle;">
                                <div style="width:48px;height:48px;border-radius:50%;background-color:#ffffff;border:2px solid #ffffff;padding:2px;box-shadow:0 2px 4px rgba(0,0,0,0.1);position:relative;">
                                  ${logoUrl ? `
                                  <img src="${logoUrl}" alt="${profile.company || ''}" style="width:100%;height:100%;border-radius:50%;object-fit:contain;display:block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                  <div style="width:100%;height:100%;border-radius:50%;background-color:#f3f4f6;display:none;align-items:center;justify-content:center;color:#6b7280;font-size:14px;font-weight:600;font-family:Arial,sans-serif;position:absolute;top:0;left:0;">
                                    ${profile.company.charAt(0).toUpperCase()}
                                  </div>
                                  ` : `
                                  <div style="width:100%;height:100%;border-radius:50%;background-color:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#6b7280;font-size:14px;font-weight:600;font-family:Arial,sans-serif;">
                                    ${profile.company.charAt(0).toUpperCase()}
                                  </div>
                                  `}
                                </div>
                              </td>
                              ` : ''}
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr style="padding:0px;margin:0px;">
              <td style="font-size:18px;font-weight:600;padding:0px;margin:0px;line-height:1.2 !important;">
                <table style="border-spacing:0px;border-collapse:collapse;">
                  <tbody>
                    <tr>
                      <td id="signature-fullname" colspan="2" style="font-size:18px;margin:0px;font-weight:600;text-overflow:ellipsis;display:block;white-space:nowrap;padding:0px;overflow:hidden;font-family:Arial,sans-serif;">${profile.displayName}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;font-weight:400;color:rgb(79,79,79);padding:0px;line-height:15px !important;">
                <span style="font-size:12px;font-weight:400;color:rgb(79,79,79);line-height:15px;font-family:Arial,sans-serif;">${profile.title || ''}</span>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;font-weight:400;color:rgb(79,79,79);padding:0px;line-height:15px !important;">
                <span style="font-size:12px;font-weight:400;color:rgb(79,79,79);line-height:15px;font-family:Arial,sans-serif;">${profile.company || ''}</span>
              </td>
            </tr>
            ${address ? `
            <tr>
              <td style="font-size:12px;font-weight:400;color:rgb(130,130,130);padding:10px 0px 0px;line-height:15px !important;">
                <span style="display:block;padding-top:2px;font-family:Arial,sans-serif;">${address}</span>
              </td>
            </tr>
            ` : ''}
            ${profile.contactInfo?.phone ? `
            <tr>
              <td style="font-size:12px;font-weight:400;color:rgb(130,130,130);padding:0px;height:16px;line-height:15px !important;">
                <span style="font-family:Arial,sans-serif;">${profile.contactInfo.phone}</span>
              </td>
            </tr>
            ` : ''}
            <tr>
              <td colspan="2" style="padding-top:8px;padding-bottom:20px;min-width:166px;vertical-align:middle;height:20px;">
                <table style="border-collapse:collapse;">
                  <tbody>
                    <tr>
                      ${contactIcons.join('')}
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
      <td style="padding:0px;line-height:1.2 !important;"></td>
      <td align="center" style="padding:20px 20px 0px 40px;vertical-align:top;">
        <table style="width:180px;">
          <tbody>
            <tr>
              <td style="text-align:center;padding-bottom:8px;padding-top:5px;">
                <span style="font-size:12px;font-weight:500;color:rgb(130,130,130);display:block;font-family:Arial,sans-serif;">Connect with me</span>
              </td>
            </tr>
            <tr>
              <td style="text-align:center;margin:0px auto;height:190px;vertical-align:middle;line-height:1.2 !important;">
                ${qrCodeUrl ? `
                <img width="172" height="190" id="qrcodeWithLogo" alt="qrcodeWithLogo" src="${qrCodeUrl}" style="width:172px;height:190px;display:block;margin:0 auto;">
                ` : `
                <div style="width:172px;height:190px;background-color:#f9fafb;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-family:Arial,sans-serif;font-size:11px;margin:0 auto;">
                  QR Code
                </div>
                `}
              </td>
            </tr>
            <tr>
              <td id="digital-card" colspan="1" style="max-width:96px;text-align:center;padding-top:8px;padding-bottom:20px;">
                <a href="${contactUrl}" target="_blank" rel="noreferrer" style="font-size:12px;text-align:center;text-decoration:none;font-weight:400;color:rgb(41,174,248);display:block;">My Digital Business Card</a>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>`.trim();

    return successResponse({ html: signatureHtml });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to generate signature', 500);
  }
}
