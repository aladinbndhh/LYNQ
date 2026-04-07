import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OrgSettingsClient } from '@/app/org/[subdomain]/admin/settings/org-settings-client';
import { OrgTeamClient } from '@/app/org/[subdomain]/admin/team/org-team-client';

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'lynq.cards';

export default async function DashboardOrganizationPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'admin') redirect('/dashboard');

  const sub = session.user.tenantSubdomain;
  const portalUrl = sub ? `https://${sub}.${ROOT}/admin` : null;

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organisation</h1>
        <p className="text-muted-foreground mt-1">
          Manage your team, invitations, and public org subdomain. Only organisation admins see this page.
        </p>
        {portalUrl && (
          <p className="text-sm text-primary mt-3">
            Org admin portal:{' '}
            <a href={portalUrl} className="underline font-medium">
              {sub}.{ROOT}
            </a>
          </p>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Settings</h2>
        <OrgSettingsClient />
      </section>

      <section className="space-y-4 border-t border-border pt-10">
        <h2 className="text-lg font-semibold">Team & invitations</h2>
        <OrgTeamClient />
      </section>
    </div>
  );
}
