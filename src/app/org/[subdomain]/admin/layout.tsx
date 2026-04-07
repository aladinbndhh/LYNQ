import Link from 'next/link';
import { requireOrgAdminOnSubdomain, getOrgPathPrefixes } from '@/lib/org/access';

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'lynq.cards';

export default async function OrgAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const { tenant } = await requireOrgAdminOnSubdomain(subdomain);
  const apex = process.env.NEXT_PUBLIC_APP_URL || `https://${ROOT}`;
  const { adminBase: base, portalHome } = await getOrgPathPrefixes(subdomain);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={portalHome} className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="" className="w-8 h-8 object-contain" />
              <span className="font-bold truncate">{tenant.name}</span>
            </Link>
            <span className="text-xs text-muted-foreground hidden sm:inline truncate">
              {subdomain}.{ROOT}
            </span>
          </div>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href={base}
              className="px-3 py-1.5 rounded-lg hover:bg-muted font-medium text-muted-foreground hover:text-foreground"
            >
              Overview
            </Link>
            <Link
              href={`${base}/team`}
              className="px-3 py-1.5 rounded-lg hover:bg-muted font-medium text-muted-foreground hover:text-foreground"
            >
              Team
            </Link>
            <Link
              href={`${base}/settings`}
              className="px-3 py-1.5 rounded-lg hover:bg-muted font-medium text-muted-foreground hover:text-foreground"
            >
              Settings
            </Link>
            <a
              href={`${apex}/dashboard`}
              className="px-3 py-1.5 rounded-lg hover:bg-muted font-medium text-primary ml-2"
            >
              App dashboard
            </a>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
