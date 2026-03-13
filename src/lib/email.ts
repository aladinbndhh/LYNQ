import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'LynQ <noreply@lynq.cards>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://lynq.cards';

// ─── Shared layout wrapper ──────────────────────────────────────────────────
function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LynQ</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:10px;">
                    <img src="${APP_URL}/logo.png" width="40" height="40" alt="LynQ" style="display:block;border-radius:10px;" />
                  </td>
                  <td style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">LynQ</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;font-size:12px;color:#475569;line-height:1.6;">
              © ${new Date().getFullYear()} LynQ · <a href="${APP_URL}" style="color:#6366f1;text-decoration:none;">lynq.cards</a><br/>
              You received this email because you signed up for a LynQ account.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── OTP Email ───────────────────────────────────────────────────────────────
export async function sendOtpEmail(email: string, name: string, otp: string) {
  const html = layout(`
    <div style="padding:40px 40px 32px;">
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#f1f5f9;">Verify your email</h1>
      <p style="margin:0 0 32px;font-size:15px;color:#94a3b8;line-height:1.6;">
        Hi ${name}, enter the code below to verify your LynQ account.
        This code expires in <strong style="color:#e2e8f0;">10 minutes</strong>.
      </p>

      <!-- OTP block -->
      <div style="background:#0f172a;border-radius:12px;border:1px solid #334155;padding:28px;text-align:center;margin-bottom:32px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#64748b;letter-spacing:2px;text-transform:uppercase;">Your verification code</p>
        <p style="margin:0;font-size:44px;font-weight:800;letter-spacing:14px;color:#6366f1;font-family:monospace;">${otp}</p>
      </div>

      <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
        Didn't request this? You can safely ignore this email.<br/>
        Never share this code with anyone.
      </p>
    </div>

    <div style="background:#0f172a;border-top:1px solid #1e293b;padding:16px 40px;">
      <p style="margin:0;font-size:12px;color:#334155;">Code valid for 10 minutes · One-time use only</p>
    </div>
  `);

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `${otp} is your LynQ verification code`,
    html,
  });
}

// ─── Welcome Email ───────────────────────────────────────────────────────────
export async function sendWelcomeEmail(email: string, name: string) {
  const firstName = name.split(' ')[0];

  const html = layout(`
    <div style="padding:40px 40px 32px;">

      <!-- Gradient banner -->
      <div style="background:linear-gradient(135deg,#6366f1,#ec4899);border-radius:10px;padding:24px;margin-bottom:32px;text-align:center;">
        <p style="margin:0;font-size:32px;">🎉</p>
        <p style="margin:8px 0 0;font-size:18px;font-weight:800;color:#fff;">Welcome to LynQ, ${firstName}!</p>
        <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Your smart digital identity is ready.</p>
      </div>

      <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;line-height:1.7;">
        You're all set. Here's what you can do with LynQ:
      </p>

      <!-- Feature list -->
      <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
        ${[
          ['💳', 'Digital Business Cards', 'Create beautiful cards with QR + NFC support'],
          ['🤖', 'AI Secretary', 'Automatically capture leads and book meetings'],
          ['📊', 'Analytics Dashboard', 'Track every view, lead, and conversation'],
          ['✉️', 'Email Signatures', 'Build branded signatures in minutes'],
        ].map(([icon, title, desc]) => `
        <tr>
          <td style="padding:10px 0;vertical-align:top;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:22px;padding-right:14px;padding-top:2px;">${icon}</td>
                <td>
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#e2e8f0;">${title}</p>
                  <p style="margin:0;font-size:13px;color:#64748b;">${desc}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`).join('')}
      </table>

      <!-- CTA -->
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;">
            <a href="${APP_URL}/dashboard" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
              Go to Dashboard →
            </a>
          </td>
        </tr>
      </table>
    </div>

    <div style="background:#0f172a;border-top:1px solid #1e293b;padding:16px 40px;">
      <p style="margin:0;font-size:12px;color:#334155;">
        Need help? Reply to this email or visit <a href="${APP_URL}" style="color:#6366f1;text-decoration:none;">lynq.cards</a>
      </p>
    </div>
  `);

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Welcome to LynQ, ${firstName}! 🎉`,
    html,
  });
}
