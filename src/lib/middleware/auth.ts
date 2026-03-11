import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyToken } from '@/lib/utils/auth';
import { SessionUser } from '@/types';

export async function getSession(request: NextRequest): Promise<SessionUser | null> {
  try {
    // 1. Check for Bearer token (used by mobile app)
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = verifyToken(token);
      if (session) return session;
    }

    // 2. Check for NextAuth session (used by web app)
    const nextAuthSession = await getServerSession(authOptions);
    if (nextAuthSession?.user) {
      return {
        id: nextAuthSession.user.id,
        email: nextAuthSession.user.email,
        name: nextAuthSession.user.name,
        tenantId: nextAuthSession.user.tenantId,
        role: nextAuthSession.user.role,
      };
    }

    return null;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<SessionUser> {
  const session = await getSession(request);

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

export async function requireAdmin(request: NextRequest): Promise<SessionUser> {
  const session = await requireAuth(request);

  if (session.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return session;
}
