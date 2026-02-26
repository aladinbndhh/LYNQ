import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import { SessionUser } from '@/types';

export async function getSession(request: NextRequest): Promise<SessionUser | null> {
  try {
    // Check for Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = verifyToken(token);
      return session;
    }

    // Check for session cookie
    const sessionCookie = request.cookies.get('session');
    if (sessionCookie?.value) {
      const session = verifyToken(sessionCookie.value);
      return session;
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
