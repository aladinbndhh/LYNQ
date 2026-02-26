'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProfileForm } from '@/components/profiles/profile-form';

export default function NewProfilePage() {
  const router = useRouter();

  const handleSave = async (data: any) => {
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/dashboard/profiles');
      } else {
        alert(result.error || 'Failed to create profile');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create profile');
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/profiles');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">
                LynQ
              </Link>
              <Link href="/dashboard/profiles" className="text-muted-foreground hover:text-foreground">
                ← Back to Profiles
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Create New Profile</h2>
          <p className="text-muted-foreground mt-2">
            Set up your digital business card with company logo badge
          </p>
        </div>

        <ProfileForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
}
