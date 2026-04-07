import { requireOrgAdminOnSubdomain } from '@/lib/org/access';
import { OrgSettingsClient } from './org-settings-client';

export default async function OrgSettingsPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  await requireOrgAdminOnSubdomain(subdomain);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organisation settings</h1>
        <p className="text-muted-foreground mt-1">
          Name and subdomain for your organisation workspace ({subdomain}…).
        </p>
      </div>
      <OrgSettingsClient />
    </div>
  );
}
