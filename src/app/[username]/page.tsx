import { notFound } from 'next/navigation';
import Image from 'next/image';
import connectDB from '@/lib/db/connection';
import { ProfileService } from '@/lib/services/profile.service';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { ModernChatWidget } from '@/components/ui/modern-chat-widget';
import { EnhancedProfileCard } from '@/components/ui/enhanced-profile-card';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  await connectDB();
  const { username } = await params;
  const profile = await ProfileService.getProfileByUsername(username);

  if (!profile) {
    return {
      title: 'Profile Not Found',
    };
  }

  return {
    title: `${profile.displayName} - ${profile.title}`,
    description: profile.bio || `Connect with ${profile.displayName}`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  await connectDB();
  const { username } = await params;
  const profile = await ProfileService.getProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  // Track profile view (will implement analytics service next)
  // await AnalyticsService.trackEvent(...)

  const primaryColor = profile.branding?.primaryColor || '#3b82f6';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div
        className="h-48 md:h-64"
        style={{
          background: profile.coverImage
            ? `url(${profile.coverImage}) center/cover`
            : `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
        }}
      />

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-20">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Avatar */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.displayName}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              {profile.branding?.logo && (
                <div className="mb-2">
                  <Image
                    src={profile.branding.logo}
                    alt="Company Logo"
                    width={80}
                    height={40}
                    className="inline-block"
                  />
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900">{profile.displayName}</h1>
              {profile.title && (
                <p className="text-lg text-gray-600 mt-1">{profile.title}</p>
              )}
              {profile.company && (
                <p className="text-md text-gray-500">{profile.company}</p>
              )}
            </div>

            {/* QR Code */}
            {profile.qrCode && (
              <div className="hidden md:block">
                <Image
                  src={profile.qrCode}
                  alt="QR Code"
                  width={120}
                  height={120}
                  className="rounded-lg border border-gray-200"
                />
                <p className="text-xs text-center text-gray-500 mt-2">Scan to save</p>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6 text-gray-700">
              <p>{profile.bio}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
            {profile.contactInfo?.email && (
              <a
                href={`mailto:${profile.contactInfo.email}`}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                📧 Email
              </a>
            )}
            {profile.contactInfo?.phone && (
              <a
                href={`tel:${profile.contactInfo.phone}`}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                📱 Call
              </a>
            )}
            {profile.contactInfo?.linkedin && (
              <a
                href={profile.contactInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                💼 LinkedIn
              </a>
            )}
            {profile.contactInfo?.twitter && (
              <a
                href={profile.contactInfo.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                🐦 Twitter
              </a>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            {profile.aiConfig?.enabled && (
              <button
                className="flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                💬 Chat with AI Secretary
              </button>
            )}
            <button
              className="flex-1 py-3 px-6 rounded-lg font-semibold border-2 transition-colors"
              style={{
                borderColor: primaryColor,
                color: primaryColor,
              }}
            >
              📅 Book a Meeting
            </button>
          </div>
        </div>

        {/* Mobile QR Code */}
        {profile.qrCode && (
          <div className="md:hidden mt-8 bg-white rounded-xl shadow-lg p-6 text-center">
            <Image
              src={profile.qrCode}
              alt="QR Code"
              width={200}
              height={200}
              className="mx-auto rounded-lg border border-gray-200"
            />
            <p className="text-sm text-gray-500 mt-4">Scan to save contact</p>
          </div>
        )}
      </div>

      {/* Powered by LynQ */}
      <div className="text-center py-8 text-gray-500 text-sm">
        <p>Powered by <span className="font-semibold">LynQ</span></p>
      </div>

      {/* AI Chat Widget */}
      {profile.aiConfig?.enabled && (
        <ModernChatWidget
          profileId={(profile.id?.toString() || profile._id?.toString() || '')}
          greeting={profile.aiConfig.greeting}
          primaryColor={profile.branding?.primaryColor}
          assistantName="AI Secretary"
        />
      )}
    </div>
  );
}
