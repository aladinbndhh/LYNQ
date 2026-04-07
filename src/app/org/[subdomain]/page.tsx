import Link from 'next/link';
import { getOrgPortalContext, getOrgPathPrefixes } from '@/lib/org/access';

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'lynq.cards';

export default async function OrgPortalPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const { session, tenant } = await getOrgPortalContext(subdomain);
  const { adminBase } = await getOrgPathPrefixes(subdomain);
  const apex = process.env.NEXT_PUBLIC_APP_URL || `https://${ROOT}`;
  const isMember = session?.user?.tenantId === tenant._id.toString();
  const isAdmin = isMember && session?.user?.role === 'admin';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-16">
      <img src="/logo.png" alt="LynQ" className="w-16 h-16 mb-6 object-contain" />
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">{tenant.name}</h1>
      <p className="text-muted-foreground mb-8 text-center">
        Organisation workspace ·{' '}
        <span className="text-primary font-medium">
          {subdomain}.{ROOT}
        </span>
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        {isAdmin && (
          <Link
            href={adminBase}
            prefetch={false}
            className="flex-1 text-center rounded-xl bg-primary text-primary-foreground py-3 px-4 font-semibold hover:opacity-90 transition-opacity"
          >
            Organisation admin
          </Link>
        )}
        {session && isMember && (
          <a
            href={`${apex}/dashboard`}
            className="flex-1 text-center rounded-xl border border-border bg-card py-3 px-4 font-semibold hover:bg-muted/50 transition-colors"
          >
            LynQ dashboard
          </a>
        )}
        {!session && (
          <a
            href={`${apex}/login?callbackUrl=${encodeURIComponent(`https://${subdomain}.${ROOT}/admin`)}`}
            className="flex-1 text-center rounded-xl bg-primary text-primary-foreground py-3 px-4 font-semibold hover:opacity-90 transition-opacity"
          >
            Sign in
          </a>
        )}
      </div>
    </div>
  );
}
