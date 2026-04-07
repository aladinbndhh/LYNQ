import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/connection';
import { Tenant } from '@/lib/db/models';

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'lynq.cards';

export async function getTenantBySubdomain(subdomain: string) {
  await connectDB();
  const tenant = await Tenant.findOne({ subdomain: subdomain.toLowerCase() }).lean();
  if (!tenant) notFound();
  return tenant as {
    _id: { toString(): string };
    name: string;
    email: string;
    subdomain?: string;
  };
}

function apexLoginUrl(callbackUrl: string) {
  const apex = process.env.NEXT_PUBLIC_APP_URL || `https://${ROOT}`;
  return `${apex}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export async function requireOrgAdminOnSubdomain(subdomain: string) {
  const tenant = await getTenantBySubdomain(subdomain);
  const session = await getServerSession(authOptions);

  const hList = await headers();
  const h = (hList.get('host') || '').split(':')[0].toLowerCase();
  const proto = hList.get('x-forwarded-proto') || 'https';
  const onOrgHost = h.startsWith(`${subdomain.toLowerCase()}.`);
  const backToAdmin = onOrgHost
    ? `${proto}://${h}/admin`
    : `${proto}://${h || `${subdomain}.${ROOT}`}/org/${subdomain}/admin`;

  if (!session?.user) {
    redirect(apexLoginUrl(backToAdmin));
  }

  if (session.user.tenantId !== tenant._id.toString()) {
    redirect('/dashboard');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return { session, tenant };
}

export async function getOrgPortalContext(subdomain: string) {
  const tenant = await getTenantBySubdomain(subdomain);
  const session = await getServerSession(authOptions);
  return { session, tenant };
}

/** Paths for links: on acme.lynq.cards use /admin; on apex use /org/acme/admin */
export async function getOrgPathPrefixes(subdomain: string) {
  const hList = await headers();
  const h = hList.get('host')?.split(':')[0]?.toLowerCase() || '';
  const onOrgHost = h.startsWith(`${subdomain.toLowerCase()}.`);
  return {
    adminBase: onOrgHost ? '/admin' : `/org/${subdomain}/admin`,
    portalHome: onOrgHost ? '/' : `/org/${subdomain}`,
  };
}
