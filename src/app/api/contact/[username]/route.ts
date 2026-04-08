import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { ProfileService } from '@/lib/services/profile.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  await connectDB();
  const { username } = await params;
  const profile = await ProfileService.getProfileByUsername(username);

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'https://lynq.cards';
  const cardUrl = `${appUrl}/${profile.username}`;

  // ── Build vCard 3.0 ────────────────────────────────────────────────────
  // Split displayName into first / last parts (best-effort)
  const nameParts = profile.displayName.trim().split(/\s+/);
  const firstName = nameParts.slice(0, -1).join(' ') || profile.displayName;
  const lastName  = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escape(profile.displayName)}`,
    `N:${escape(lastName)};${escape(firstName)};;;`,
  ];

  if (profile.company)            lines.push(`ORG:${escape(profile.company)}`);
  if (profile.title)              lines.push(`TITLE:${escape(profile.title)}`);
  if (profile.contactInfo?.email) lines.push(`EMAIL;TYPE=INTERNET:${profile.contactInfo.email}`);
  if (profile.contactInfo?.phone) lines.push(`TEL;TYPE=CELL:${profile.contactInfo.phone}`);
  if (profile.contactInfo?.linkedin) lines.push(`URL;TYPE=linkedin:${profile.contactInfo.linkedin}`);
  if (profile.contactInfo?.twitter)  lines.push(`URL;TYPE=twitter:${profile.contactInfo.twitter}`);
  if (profile.avatar)             lines.push(`PHOTO;VALUE=URL:${profile.avatar}`);
  if (profile.bio)                lines.push(`NOTE:${escape(profile.bio)}`);

  lines.push(`URL:${cardUrl}`);
  lines.push(`X-LYNQ-CARD:${cardUrl}`);
  lines.push('END:VCARD');

  const vcf = lines.join('\r\n') + '\r\n';

  return new NextResponse(vcf, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${profile.username}.vcf"`,
      'Cache-Control': 'no-store',
    },
  });
}

/** Escape vCard special characters (semicolons, commas, backslashes, newlines). */
function escape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}
