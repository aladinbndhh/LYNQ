'use client';

import * as React from 'react';

interface EmailSignatureProps {
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  avatar?: string;
  companyLogo?: string;
  qrCode?: string;
  primaryColor?: string;
}

export function EmailSignatureTemplate({
  name,
  title,
  company,
  email,
  phone,
  website,
  linkedin,
  twitter,
  avatar,
  companyLogo,
  qrCode,
  primaryColor = '#3b82f6',
}: EmailSignatureProps) {
  const [copied, setCopied] = React.useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const generateHTMLSignature = () => {
    // Get Odoo URL from environment (should be set to actual Odoo instance)
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL || process.env.ODOO_URL || 'https://aladinbndhh-lynq-test-live-29061122.dev.odoo.com';
    
    // Ensure avatar and logo use Odoo URLs (absolute URLs)
    const avatarUrl = avatar 
      ? (avatar.startsWith('http') ? avatar : `${odooUrl}${avatar.startsWith('/') ? '' : '/'}${avatar}`)
      : null;
    // Always set logo URL if company exists - construct from profile ID if available
    // Note: This component doesn't have profile ID, so we rely on companyLogo prop
    const logoUrl = company && companyLogo
      ? (companyLogo.startsWith('http') ? companyLogo : `${odooUrl}${companyLogo.startsWith('/') ? '' : '/'}${companyLogo}`)
      : null;
    const qrCodeUrl = qrCode
      ? (qrCode.startsWith('http') ? qrCode : `${odooUrl}${qrCode.startsWith('/') ? '' : '/'}${qrCode}`)
      : null;

    // Build contact icons HTML
    const contactIcons = [];
    if (phone) {
      contactIcons.push(`<td style="padding:2px 6px 0px 0px;display:table-cell;"><a href="tel:${phone}" style="display:inline-block;width:20px;height:20px;"><img alt="Phone number" width="20" height="20" src="https://dash.popl.co/assets/img/new-links/call.png" style="width:20px;height:20px;border:0px;border-radius:4px;"></a></td>`);
    }
    if (email) {
      contactIcons.push(`<td style="padding:2px 6px 0px 0px;display:table-cell;"><a href="mailto:${email}" style="display:inline-block;width:20px;height:20px;"><img alt="email icon for mail" width="20" height="20" src="https://dash.popl.co/assets/img/new-links/email.png" style="width:20px;height:20px;border:0px;border-radius:4px;"></a></td>`);
    }
    if (website) {
      contactIcons.push(`<td style="padding:2px 6px 0px 0px;display:table-cell;"><a href="${website}" style="display:inline-block;width:20px;height:20px;"><img alt="maps logo" width="20" height="20" src="https://dash.popl.co/assets/img/new-links/address.png" style="width:20px;height:20px;border:0px;border-radius:4px;"></a></td>`);
      contactIcons.push(`<td style="padding:2px 6px 0px 0px;display:table-cell;"><a href="${website}" style="display:inline-block;width:20px;height:20px;"><img alt="website logo in blue" width="20" height="20" src="https://dash.popl.co/assets/img/new-links/website.png" style="width:20px;height:20px;border:0px;border-radius:4px;"></a></td>`);
    }

    return `
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
                                  ${getInitials(name)}
                                </div>
                                `}
                              </td>
                              ${company ? `
                              <td style="padding:0px 0px 0px 10px;vertical-align:middle;">
                                <div style="width:48px;height:48px;border-radius:50%;background-color:#ffffff;border:2px solid #ffffff;padding:2px;box-shadow:0 2px 4px rgba(0,0,0,0.1);position:relative;">
                                  ${logoUrl ? `
                                  <img src="${logoUrl}" alt="${company || ''}" style="width:100%;height:100%;border-radius:50%;object-fit:contain;display:block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                  <div style="width:100%;height:100%;border-radius:50%;background-color:#f3f4f6;display:none;align-items:center;justify-content:center;color:#6b7280;font-size:14px;font-weight:600;font-family:Arial,sans-serif;position:absolute;top:0;left:0;">
                                    ${company.charAt(0).toUpperCase()}
                                  </div>
                                  ` : `
                                  <div style="width:100%;height:100%;border-radius:50%;background-color:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#6b7280;font-size:14px;font-weight:600;font-family:Arial,sans-serif;">
                                    ${company.charAt(0).toUpperCase()}
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
                      <td id="signature-fullname" colspan="2" style="font-size:18px;margin:0px;font-weight:600;text-overflow:ellipsis;display:block;white-space:nowrap;padding:0px;overflow:hidden;font-family:Arial,sans-serif;">${name}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;font-weight:400;color:rgb(79,79,79);padding:0px;line-height:15px !important;">
                <span style="font-size:12px;font-weight:400;color:rgb(79,79,79);line-height:15px;font-family:Arial,sans-serif;">${title || ''}</span>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;font-weight:400;color:rgb(79,79,79);padding:0px;line-height:15px !important;">
                <span style="font-size:12px;font-weight:400;color:rgb(79,79,79);line-height:15px;font-family:Arial,sans-serif;">${company || ''}</span>
              </td>
            </tr>
            ${phone ? `
            <tr>
              <td style="font-size:12px;font-weight:400;color:rgb(130,130,130);padding:0px;height:16px;line-height:15px !important;">
                <span style="font-family:Arial,sans-serif;">${phone}</span>
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
                <a href="${website || '#'}" target="_blank" rel="noreferrer" style="font-size:12px;text-align:center;text-decoration:none;font-weight:400;color:rgb(41,174,248);display:block;">My Digital Business Card</a>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
    `.trim();
  };

  const copyToClipboard = () => {
    const html = generateHTMLSignature();
    
    // Create a temporary element to hold the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv);

    // Copy to clipboard
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
    }

    document.body.removeChild(tempDiv);

    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Email Signature</h2>
        <p className="text-sm text-muted-foreground">
          Copy and paste this signature into your email client
        </p>
      </div>

      {/* Preview */}
      <div className="border border-border rounded-lg p-8 bg-background">
        <div className="max-w-2xl">
          <div className="flex items-start gap-6">
            {/* Avatar with Company Logo */}
            <div className="relative flex-shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-[70px] h-[70px] rounded-full object-cover"
                  style={{ border: `2px solid ${primaryColor}` }}
                />
              ) : (
                <div
                  className="w-[70px] h-[70px] rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {getInitials(name)}
                </div>
              )}

              {companyLogo && (
                <img
                  src={companyLogo}
                  alt={company}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-white p-0.5 object-contain"
                />
              )}
            </div>

            {/* Contact Info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-sm font-medium mb-3" style={{ color: primaryColor }}>
                {company}
              </p>

              <div className="space-y-1 text-sm text-muted-foreground">
                {email && <div>📧 {email}</div>}
                {phone && <div>📱 {phone}</div>}
                {website && <div>🌐 {website}</div>}
              </div>

              {(linkedin || twitter) && (
                <div className="flex items-center gap-2 mt-3">
                  {linkedin && (
                    <a href={linkedin} target="_blank" rel="noopener noreferrer">
                      <img
                        src="https://img.icons8.com/color/32/000000/linkedin.png"
                        alt="LinkedIn"
                        className="w-5 h-5"
                      />
                    </a>
                  )}
                  {twitter && (
                    <a href={twitter} target="_blank" rel="noopener noreferrer">
                      <img
                        src="https://img.icons8.com/color/32/000000/twitter.png"
                        alt="Twitter"
                        className="w-5 h-5"
                      />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* QR Code */}
            {qrCode && (
              <div className="flex-shrink-0 text-center">
                <img
                  src={qrCode}
                  alt="Scan to connect"
                  className="w-[100px] h-[100px] border border-border rounded-lg p-1 bg-white"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Scan to connect</p>
              </div>
            )}
          </div>

          <div className="h-px bg-border my-4" />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Powered by</span>
            <span className="font-semibold" style={{ color: primaryColor }}>
              LynQ
            </span>
          </div>
        </div>
      </div>

      {/* Copy Button */}
      <div className="flex justify-center">
        <button
          onClick={copyToClipboard}
          className="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          {copied ? '✓ Copied to Clipboard!' : 'Copy Email Signature'}
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-3">How to use:</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li>1. Click the "Copy Email Signature" button above</li>
          <li>2. Open your email client settings (Gmail, Outlook, etc.)</li>
          <li>3. Navigate to the signature settings</li>
          <li>4. Paste the signature (Ctrl+V or Cmd+V)</li>
          <li>5. Save your settings</li>
        </ol>
      </div>
    </div>
  );
}
