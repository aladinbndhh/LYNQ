import Link from 'next/link';
import { Types } from 'mongoose';
import { requireOrgAdminOnSubdomain, getOrgPathPrefixes } from '@/lib/org/access';
import { OrgAdminService } from '@/lib/services/org-admin.service';

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'lynq.cards';

export default async function OrgAdminOverviewPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const { tenant } = await requireOrgAdminOnSubdomain(subdomain);
  const { adminBase } = await getOrgPathPrefixes(subdomain);
  const tid = new Types.ObjectId(tenant._id.toString());

  const [users, invites] = await Promise.all([
    OrgAdminService.listUsers(tid),
    OrgAdminService.listInvitations(tid),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organisation overview</h1>
        <p className="text-muted-foreground mt-1">
          Manage your team, invitations, and subdomain from the admin console.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Members</p>
          <p className="text-3xl font-bold mt-1">{users.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Pending invites</p>
          <p className="text-3xl font-bold mt-1">{invites.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Subdomain</p>
          <p className="text-lg font-semibold mt-1 truncate">
            {tenant.subdomain ? `${tenant.subdomain}.${ROOT}` : 'Not set'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`${adminBase}/team`}
          className="inline-flex items-center rounded-xl bg-primary text-primary-foreground px-5 py-2.5 font-semibold text-sm hover:opacity-90"
        >
          Manage team & invites
        </Link>
        <Link
          href={`${adminBase}/settings`}
          className="inline-flex items-center rounded-xl border border-border bg-card px-5 py-2.5 font-semibold text-sm hover:bg-muted/50"
        >
          Organisation settings
        </Link>
      </div>
    </div>
  );
}
