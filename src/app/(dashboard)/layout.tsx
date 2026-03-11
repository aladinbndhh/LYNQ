import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav
        userName={session.user.name || 'User'}
        userEmail={session.user.email || undefined}
        userAvatar={(session.user as any).image || undefined}
      />
      {children}
    </div>
  );
}
