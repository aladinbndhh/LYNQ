import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { ProfileService } from '@/lib/services/profile.service';
import { Lead } from '@/lib/db/models';
import {
  successResponse,
  errorResponse,
  parseRequestBody,
} from '@/lib/utils/api';

// ── GET /api/contact/[username] — download vCard ───────────────────────────
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

  const nameParts = profile.displayName.trim().split(/\s+/);
  const firstName = nameParts.slice(0, -1).join(' ') || profile.displayName;
  const lastName  = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${vcEscape(profile.displayName)}`,
    `N:${vcEscape(lastName)};${vcEscape(firstName)};;;`,
  ];

  if (profile.company)               lines.push(`ORG:${vcEscape(profile.company)}`);
  if (profile.title)                 lines.push(`TITLE:${vcEscape(profile.title)}`);
  if (profile.contactInfo?.email)    lines.push(`EMAIL;TYPE=INTERNET:${profile.contactInfo.email}`);
  if (profile.contactInfo?.phone)    lines.push(`TEL;TYPE=CELL:${profile.contactInfo.phone}`);
  if (profile.contactInfo?.linkedin) lines.push(`URL;TYPE=linkedin:${profile.contactInfo.linkedin}`);
  if (profile.contactInfo?.twitter)  lines.push(`URL;TYPE=twitter:${profile.contactInfo.twitter}`);
  if (profile.avatar)                lines.push(`PHOTO;VALUE=URL:${profile.avatar}`);
  if (profile.bio)                   lines.push(`NOTE:${vcEscape(profile.bio)}`);
  lines.push(`URL:${cardUrl}`);
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

// ── POST /api/contact/[username] — capture lead ────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    await connectDB();
    const { username } = await params;
    const profile = await ProfileService.getProfileByUsername(username);

    if (!profile) return errorResponse('Profile not found', 404);

    const body = await parseRequestBody(req);
    const { name, email, phone, company } = body as {
      name: string;
      email: string;
      phone?: string;
      company?: string;
    };

    if (!name?.trim())  return errorResponse('Name is required', 400);
    if (!email?.trim()) return errorResponse('Email is required', 400);

    await Lead.create({
      tenantId:  (profile as any).tenantId,
      profileId: (profile as any)._id,
      name:      name.trim(),
      email:     email.trim().toLowerCase(),
      phone:     phone?.trim() || undefined,
      company:   company?.trim() || undefined,
      source:    'link',
      status:    'new',
    });

    return successResponse({ ok: true });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to save lead', 500);
  }
}

function vcEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}
