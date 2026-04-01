import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { findOrCreateGoogleUser } from '@/lib/auth';
import { generateToken } from '@/lib/utils/auth';

const APP_SCHEME = 'lynq://auth';

/**
 * GET /api/auth/mobile/google/callback
 *
 * Google redirects here after user approves OAuth.
 * Exchanges the code for tokens, finds/creates the user,
 * generates a LynQ JWT, and redirects to the deep link:
 *   lynq://auth?token=JWT&name=...&email=...&avatar=...
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    const msg = error === 'access_denied' ? 'cancelled' : (error ?? 'cancelled');
    return Response.redirect(`${APP_SCHEME}?error=${encodeURIComponent(msg)}`);
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lynq.cards';

    // Exchange authorization code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${appUrl}/api/auth/mobile/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Google token exchange failed:', err);
      throw new Error('Failed to exchange authorization code');
    }

    const { access_token } = await tokenRes.json();

    // Fetch user profile from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) throw new Error('Failed to fetch Google user info');

    const userInfo: {
      id: string;
      email: string;
      name: string;
      picture?: string;
    } = await userRes.json();

    await connectDB();

    // Find or create the MongoDB user (same as web sign-in)
    const mongoUser = await findOrCreateGoogleUser({
      email: userInfo.email,
      name: userInfo.name || userInfo.email.split('@')[0],
      image: userInfo.picture,
    });

    // Generate a long-lived mobile JWT
    const token = generateToken({
      id: mongoUser.userId,
      email: userInfo.email,
      name: mongoUser.name,
      tenantId: mongoUser.tenantId,
      role: mongoUser.role,
    });

    // Redirect to the app's deep link with all needed data
    const params = new URLSearchParams({
      token,
      name: mongoUser.name,
      email: userInfo.email,
      role: mongoUser.role,
      tenantId: mongoUser.tenantId,
    });
    if (userInfo.picture) params.set('avatar', userInfo.picture);

    return Response.redirect(`${APP_SCHEME}?${params.toString()}`);
  } catch (err: any) {
    console.error('Mobile Google OAuth callback error:', err);
    return Response.redirect(
      `${APP_SCHEME}?error=${encodeURIComponent(err.message || 'sign_in_failed')}`
    );
  }
}
