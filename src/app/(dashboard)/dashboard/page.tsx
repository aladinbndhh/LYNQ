import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ModernDashboard } from '@/components/dashboard/modern-dashboard';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <ModernDashboard
      userName={session.user.name || 'User'}
      userEmail={session.user.email || undefined}
      userAvatar={(session.user as any).image || undefined}
    />
  );
}
