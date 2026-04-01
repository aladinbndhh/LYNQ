import { NextResponse } from 'next/server';

/**
 * GET /api/auth/mobile/google/start
 *
 * Returns the Google OAuth URL for the Flutter app to open in a browser.
 * Uses the same GOOGLE_CLIENT_ID as the web app — no extra setup needed.
 */
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lynq.cards';

  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl}/api/auth/mobile/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.json({ url });
}
