import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RESERVED_SUBDOMAINS } from '@/lib/subdomain';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'lynq.cards';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0].toLowerCase() || '';
  const path = request.nextUrl.pathname;

  if (path.startsWith('/_next') || path.startsWith('/api')) {
    return NextResponse.next();
  }

  if (!host.endsWith(`.${ROOT_DOMAIN}`)) {
    return NextResponse.next();
  }

  const sub = host.slice(0, -(ROOT_DOMAIN.length + 1));
  if (!sub || RESERVED_SUBDOMAINS.has(sub)) {
    return NextResponse.next();
  }

  if (path.startsWith('/org/')) {
    return NextResponse.next();
  }

  const apexBase = process.env.NEXT_PUBLIC_APP_URL || `https://${ROOT_DOMAIN}`;

  if (path === '/login' || path === '/signup') {
    const back = `${request.nextUrl.origin}/admin`;
    const loginUrl = new URL('/login', apexBase);
    loginUrl.searchParams.set('callbackUrl', back);
    return NextResponse.redirect(loginUrl);
  }

  if (path === '/' || path.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = `/org/${sub}${path}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.redirect(new URL(path + request.nextUrl.search, apexBase));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
