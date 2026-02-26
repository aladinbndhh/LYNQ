'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EmailSignatureTemplate } from '@/components/email-signature/template';
import { IProfile } from '@/types';

export default function EmailSignaturePage() {
  const [profiles, setProfiles] = useState<IProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<IProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/profiles');
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setProfiles(data.data);
        setSelectedProfile(data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!selectedProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-8">
                <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                  LynQ
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Profiles Yet</h2>
          <p className="text-gray-600 mb-6">
            Create a profile first to generate your email signature
          </p>
          <Link
            href="/dashboard/profiles/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Create Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                LynQ
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Email Signature Generator</h2>
          <p className="text-gray-600">
            Generate a professional email signature with your company logo badge
          </p>
        </div>

        {/* Profile Selector */}
        {profiles.length > 1 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Profile:
            </label>
            <select
              value={selectedProfile._id.toString()}
              onChange={(e) => {
                const profile = profiles.find((p) => p._id.toString() === e.target.value);
                setSelectedProfile(profile || null);
              }}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {profiles.map((profile) => (
                <option key={profile._id.toString()} value={profile._id.toString()}>
                  {profile.displayName} (@{profile.username})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Email Signature Template */}
        <EmailSignatureTemplate
          name={selectedProfile.displayName}
          title={selectedProfile.title}
          company={selectedProfile.company}
          email={selectedProfile.contactInfo?.email}
          phone={selectedProfile.contactInfo?.phone}
          website={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${selectedProfile.username}`}
          linkedin={selectedProfile.contactInfo?.linkedin}
          twitter={selectedProfile.contactInfo?.twitter}
          avatar={selectedProfile.avatar}
          companyLogo={selectedProfile.branding?.logo}
          qrCode={selectedProfile.qrCode}
          primaryColor={selectedProfile.branding?.primaryColor}
        />
      </div>
    </div>
  );
}
