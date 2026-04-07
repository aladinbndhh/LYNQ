import { requireOrgAdminOnSubdomain } from '@/lib/org/access';
import { OrgTeamClient } from './org-team-client';

export default async function OrgTeamPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  await requireOrgAdminOnSubdomain(subdomain);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team & invitations</h1>
        <p className="text-muted-foreground mt-1">
          Invite colleagues and manage roles. Admins can access this organisation console.
        </p>
      </div>
      <OrgTeamClient />
    </div>
  );
}
