'use client';

import * as React from 'react';

export type SignatureTemplate = 'classic' | 'modern' | 'minimal' | 'branded';

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
  template?: SignatureTemplate;
  showQr?: boolean;
  showSocials?: boolean;
  showAvatar?: boolean;
}

function buildHtml(p: EmailSignatureProps): string {
  const color = p.primaryColor || '#3b82f6';
  const appUrl = (typeof window !== 'undefined' ? window.location.origin : '') || 'https://app.lynq.io';
  const cardUrl = p.website || appUrl;
  const tpl = p.template || 'classic';

  const avatarHtml = p.showAvatar !== false && p.avatar
    ? `<img src="${p.avatar}" alt="${p.name}" width="80" height="80" style="width:80px;height:80px;border-radius:50%;object-fit:cover;display:block;">`
    : p.showAvatar !== false
      ? `<div style="width:80px;height:80px;border-radius:50%;background-color:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:30px;font-weight:700;font-family:Arial,sans-serif;">${p.name.charAt(0).toUpperCase()}</div>`
      : '';

  const logoHtml = p.companyLogo
    ? `<img src="${p.companyLogo}" alt="${p.company}" width="24" height="24" style="width:24px;height:24px;border-radius:50%;object-fit:contain;border:2px solid #fff;">`
    : '';

  const socialIcons: string[] = [];
  if (p.showSocials !== false) {
    if (p.phone) socialIcons.push(`<a href="tel:${p.phone}" style="margin-right:6px;"><img src="https://dash.popl.co/assets/img/new-links/call.png" width="20" height="20" style="border-radius:4px;"></a>`);
    if (p.email) socialIcons.push(`<a href="mailto:${p.email}" style="margin-right:6px;"><img src="https://dash.popl.co/assets/img/new-links/email.png" width="20" height="20" style="border-radius:4px;"></a>`);
    if (p.linkedin) socialIcons.push(`<a href="${p.linkedin}" style="margin-right:6px;"><img src="https://img.icons8.com/color/20/000000/linkedin.png" width="20" height="20" style="border-radius:4px;"></a>`);
    if (p.twitter) socialIcons.push(`<a href="${p.twitter}" style="margin-right:6px;"><img src="https://img.icons8.com/color/20/000000/twitter--v1.png" width="20" height="20" style="border-radius:4px;"></a>`);
  }

  const qrSection = p.showQr !== false && p.qrCode
    ? `<td align="center" style="padding:16px 0 16px 24px;vertical-align:top;">
        <div style="text-align:center;">
          <img src="${p.qrCode}" alt="QR Code" width="120" height="120" style="width:120px;height:120px;display:block;border-radius:8px;border:1px solid #e2e8f0;">
          <a href="${cardUrl}" style="font-size:11px;color:${color};text-decoration:none;display:block;margin-top:6px;">My Digital Card</a>
        </div>
      </td>`
    : '';

  if (tpl === 'minimal') {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:13px;color:#374151;max-width:400px;">
  <tbody>
    <tr><td style="padding-bottom:2px;font-size:15px;font-weight:700;color:#111827;">${p.name}</td></tr>
    <tr><td style="color:#6b7280;">${p.title}${p.company ? ` · ${p.company}` : ''}</td></tr>
    <tr><td style="padding-top:8px;">
      ${p.phone ? `<a href="tel:${p.phone}" style="color:#6b7280;text-decoration:none;margin-right:12px;">📱 ${p.phone}</a>` : ''}
      ${p.email ? `<a href="mailto:${p.email}" style="color:#6b7280;text-decoration:none;margin-right:12px;">✉️ ${p.email}</a>` : ''}
    </td></tr>
    ${p.linkedin || p.twitter ? `<tr><td style="padding-top:6px;">${socialIcons.join('')}</td></tr>` : ''}
    <tr><td style="padding-top:8px;border-top:2px solid ${color};font-size:11px;color:#9ca3af;">
      <a href="${cardUrl}" style="color:${color};text-decoration:none;">View Digital Card →</a>
    </td></tr>
  </tbody>
</table>`;
  }

  if (tpl === 'modern') {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;max-width:480px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
  <tbody>
    <tr>
      <td style="background:${color};padding:16px 20px;">
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          <tr>
            <td style="vertical-align:middle;">
              ${avatarHtml ? `<div style="display:inline-block;vertical-align:middle;margin-right:12px;">${avatarHtml}</div>` : ''}
              <div style="display:inline-block;vertical-align:middle;">
                <div style="font-size:18px;font-weight:700;color:#fff;">${p.name}</div>
                <div style="font-size:13px;color:rgba(255,255,255,0.85);">${p.title}${p.company ? ` — ${p.company}` : ''}</div>
              </div>
            </td>
            ${qrSection ? `<td style="text-align:right;vertical-align:middle;">${p.qrCode ? `<img src="${p.qrCode}" width="64" height="64" style="border-radius:6px;">` : ''}</td>` : ''}
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 20px;background:#fff;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            ${p.phone ? `<td style="padding-right:16px;font-size:13px;color:#374151;">📱 <a href="tel:${p.phone}" style="color:#374151;text-decoration:none;">${p.phone}</a></td>` : ''}
            ${p.email ? `<td style="padding-right:16px;font-size:13px;color:#374151;">✉️ <a href="mailto:${p.email}" style="color:#374151;text-decoration:none;">${p.email}</a></td>` : ''}
          </tr>
          ${socialIcons.length ? `<tr><td colspan="2" style="padding-top:10px;">${socialIcons.join('')}</td></tr>` : ''}
        </table>
      </td>
    </tr>
  </tbody>
</table>`;
  }

  if (tpl === 'branded') {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;max-width:480px;border-left:4px solid ${color};">
  <tbody>
    <tr>
      <td style="padding:16px 20px;">
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          <tr>
            <td style="vertical-align:top;padding-right:16px;">
              ${avatarHtml ? `<div style="position:relative;display:inline-block;">${avatarHtml}${logoHtml ? `<div style="position:absolute;bottom:0;right:0;">${logoHtml}</div>` : ''}</div>` : ''}
            </td>
            <td style="vertical-align:top;flex:1;">
              <div style="font-size:17px;font-weight:700;color:#111827;">${p.name}</div>
              <div style="font-size:13px;color:#6b7280;margin-top:2px;">${p.title}</div>
              <div style="font-size:13px;font-weight:600;color:${color};margin-top:2px;">${p.company}</div>
              <div style="margin-top:10px;">
                ${p.phone ? `<div style="font-size:12px;color:#6b7280;margin-bottom:3px;">📱 <a href="tel:${p.phone}" style="color:#6b7280;text-decoration:none;">${p.phone}</a></div>` : ''}
                ${p.email ? `<div style="font-size:12px;color:#6b7280;margin-bottom:3px;">✉️ <a href="mailto:${p.email}" style="color:#6b7280;text-decoration:none;">${p.email}</a></div>` : ''}
                ${p.website ? `<div style="font-size:12px;color:#6b7280;margin-bottom:3px;">🌐 <a href="${p.website}" style="color:${color};text-decoration:none;">${p.website}</a></div>` : ''}
              </div>
              ${socialIcons.length ? `<div style="margin-top:10px;">${socialIcons.join('')}</div>` : ''}
            </td>
            ${qrSection}
          </tr>
        </table>
      </td>
    </tr>
  </tbody>
</table>`;
  }

  // Classic (default)
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;width:460px;border:1.3px solid #f2f2f2;box-sizing:border-box;">
  <tbody>
    <tr>
      <td style="width:220px;padding:20px 0 0 20px;vertical-align:top;">
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          <tr>
            <td style="padding-bottom:12px;">
              ${avatarHtml ? `<div style="position:relative;display:inline-block;">${avatarHtml}${logoHtml ? `<div style="position:absolute;bottom:-2px;right:-2px;">${logoHtml}</div>` : ''}</div>` : ''}
            </td>
          </tr>
          <tr><td style="font-size:17px;font-weight:700;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">${p.name}</td></tr>
          <tr><td style="font-size:12px;color:#4f4f4f;padding-top:2px;">${p.title || ''}</td></tr>
          <tr><td style="font-size:12px;color:#4f4f4f;">${p.company || ''}</td></tr>
          ${p.phone ? `<tr><td style="font-size:12px;color:#828282;padding-top:4px;">${p.phone}</td></tr>` : ''}
          <tr><td style="padding-top:10px;padding-bottom:20px;">${socialIcons.join('')}</td></tr>
        </table>
      </td>
      <td style="width:1px;background:#f2f2f2;"></td>
      <td align="center" style="padding:20px 20px 0 24px;vertical-align:top;">
        ${p.showQr !== false && p.qrCode ? `<div style="text-align:center;">
          <div style="font-size:11px;color:#828282;margin-bottom:6px;">Connect with me</div>
          <img src="${p.qrCode}" width="140" height="140" style="display:block;border-radius:8px;border:1px solid #e2e8f0;">
          <a href="${cardUrl}" style="font-size:11px;color:${color};text-decoration:none;display:block;margin-top:8px;margin-bottom:20px;">My Digital Business Card</a>
        </div>` : `<div style="padding:20px;text-align:center;">
          <a href="${cardUrl}" style="font-size:13px;color:${color};text-decoration:none;font-weight:600;">View My Card →</a>
        </div>`}
      </td>
    </tr>
  </tbody>
</table>`;
}

export function EmailSignatureTemplate(props: EmailSignatureProps) {
  const [template, setTemplate] = React.useState<SignatureTemplate>(props.template || 'classic');
  const [primaryColor, setPrimaryColor] = React.useState(props.primaryColor || '#3b82f6');
  const [showQr, setShowQr] = React.useState(props.showQr !== false);
  const [showSocials, setShowSocials] = React.useState(props.showSocials !== false);
  const [showAvatar, setShowAvatar] = React.useState(props.showAvatar !== false);
  const [copied, setCopied] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const currentProps: EmailSignatureProps = {
    ...props,
    template,
    primaryColor,
    showQr,
    showSocials,
    showAvatar,
  };

  const html = buildHtml(currentProps);

  // Update iframe preview
  React.useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`<!DOCTYPE html><html><body style="margin:16px;font-family:Arial,sans-serif;">${html}</body></html>`);
        doc.close();
      }
    }
  }, [html]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html], { type: 'text/plain' }),
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      const el = document.createElement('div');
      el.innerHTML = html;
      document.body.appendChild(el);
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      if (sel) { sel.removeAllRanges(); sel.addRange(range); document.execCommand('copy'); sel.removeAllRanges(); }
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const templates: { id: SignatureTemplate; label: string }[] = [
    { id: 'classic', label: 'Classic' },
    { id: 'modern', label: 'Modern' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'branded', label: 'Branded' },
  ];

  const presetColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#14b8a6', '#1e293b'];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-1">Email Signature Builder</h2>
        <p className="text-sm text-muted-foreground">Customize and copy your professional signature</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          {/* Template picker */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Template</p>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                    template === t.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-border text-muted-foreground hover:border-blue-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Brand Color</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {presetColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setPrimaryColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    background: c,
                    borderColor: primaryColor === c ? '#fff' : 'transparent',
                    boxShadow: primaryColor === c ? `0 0 0 2px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 text-sm border border-border rounded-lg px-2 py-1 font-mono"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Show Elements</p>
            {[
              { label: 'Profile photo', value: showAvatar, setter: setShowAvatar },
              { label: 'QR code', value: showQr, setter: setShowQr },
              { label: 'Social icons', value: showSocials, setter: setShowSocials },
            ].map(({ label, value, setter }) => (
              <label key={label} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div
                  onClick={() => setter(!value)}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${value ? 'bg-blue-500' : 'bg-gray-200'}`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </div>
              </label>
            ))}
          </div>

          {/* Install guides */}
          <div className="bg-muted/50 border border-border rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground mb-2">How to install</p>
            <ol className="space-y-1.5 text-xs text-muted-foreground">
              <li>1. Click <strong>Copy Signature</strong> below</li>
              <li>2. <strong>Gmail:</strong> Settings → See all settings → Signature → Paste</li>
              <li>3. <strong>Outlook:</strong> File → Options → Mail → Signatures → Paste</li>
              <li>4. <strong>Apple Mail:</strong> Mail → Preferences → Signatures → Paste</li>
            </ol>
          </div>
        </div>

        {/* Live preview (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs text-muted-foreground font-medium">
              Live Preview
            </div>
            <iframe
              ref={iframeRef}
              className="w-full"
              style={{ height: '260px', border: 'none' }}
              title="Signature Preview"
              sandbox="allow-same-origin"
            />
          </div>

          {/* HTML source view */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs text-muted-foreground font-medium">
              HTML Source
            </div>
            <pre className="p-4 text-xs text-muted-foreground overflow-x-auto max-h-32 font-mono whitespace-pre-wrap break-all">
              {html}
            </pre>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-base transition-colors"
            style={{ backgroundColor: copied ? '#10b981' : primaryColor }}
          >
            {copied ? '✓ Copied to Clipboard!' : 'Copy Signature'}
          </button>
        </div>
      </div>
    </div>
  );
}
