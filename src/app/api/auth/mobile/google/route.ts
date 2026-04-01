import { NextRequest } from 'next/server';
import { findOrCreateGoogleUser } from '@/lib/auth';
import { generateToken } from '@/lib/utils/auth';
import { successResponse, errorResponse, parseRequestBody } from '@/lib/utils/api';
import connectDB from '@/lib/db/connection';

interface GoogleTokenInfo {
  iss: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  exp: string;
  iat: string;
  alg: string;
  kid: string;
  typ: string;
}

/**
 * POST /api/auth/mobile/google
 *
 * Accepts a Google ID token from the Flutter app, verifies it against
 * Google's tokeninfo endpoint, finds or creates the MongoDB user, and
 * returns a long-lived JWT for the mobile client.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody<{ idToken: string }>(request);

    if (!body?.idToken) {
      return errorResponse('idToken is required', 400);
    }

    // Verify the token with Google's public endpoint
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${body.idToken}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      return errorResponse('Invalid Google token', 401);
    }

    const info: GoogleTokenInfo = await res.json();

    // Validate token audience matches our web client ID
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && info.aud !== expectedClientId) {
      return errorResponse('Token audience mismatch', 401);
    }

    // Token expiry check (exp is Unix timestamp in seconds)
    if (Date.now() / 1000 > parseInt(info.exp, 10)) {
      return errorResponse('Google token has expired', 401);
    }

    if (!info.email) {
      return errorResponse('No email in Google token', 400);
    }

    await connectDB();

    const mongoUser = await findOrCreateGoogleUser({
      email: info.email,
      name: info.name || info.email.split('@')[0],
      image: info.picture,
    });

    const token = generateToken({
      id: mongoUser.userId,
      email: info.email,
      name: mongoUser.name,
      tenantId: mongoUser.tenantId,
      role: mongoUser.role,
    });

    return successResponse(
      {
        token,
        user: {
          id: mongoUser.userId,
          email: info.email,
          name: mongoUser.name,
          role: mongoUser.role,
          tenantId: mongoUser.tenantId,
          avatar: info.picture ?? null,
        },
      },
      'Google sign-in successful'
    );
  } catch (error: any) {
    console.error('Mobile Google auth error:', error);
    return errorResponse(error.message || 'Google sign-in failed', 500);
  }
}
