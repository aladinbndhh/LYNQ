import { notFound } from 'next/navigation';
import connectDB from '@/lib/db/connection';
import { ProfileService } from '@/lib/services/profile.service';
import { ModernChatWidget } from '@/components/ui/modern-chat-widget';
import { SaveContactModal } from '@/components/ui/save-contact-modal';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  await connectDB();
  const { username } = await params;
  const profile = await ProfileService.getProfileByUsername(username);

  if (!profile) return { title: 'Profile Not Found' };

  return {
    title: `${profile.displayName}${profile.title ? ` — ${profile.title}` : ''}`,
    description: profile.bio || `Connect with ${profile.displayName}`,
    openGraph: {
      title: profile.displayName,
      description: profile.bio || `Connect with ${profile.displayName}`,
      images: profile.avatar ? [{ url: profile.avatar }] : [],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  await connectDB();
  const { username } = await params;
  const profile = await ProfileService.getProfileByUsername(username);

  if (!profile) notFound();

  const primaryColor = profile.branding?.primaryColor || '#3b82f6';
  const theme = (profile as any).branding?.theme || 'light';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cardUrl = `${appUrl}/${profile.username}`;

  const isDark = theme === 'dark' || theme === 'neon';

  const pageBg = (() => {
    switch (theme) {
      case 'dark':   return '#0f172a';
      case 'neon':   return '#020617';
      case 'gradient': return `linear-gradient(135deg, ${primaryColor}22 0%, ${primaryColor}44 100%)`;
      case 'glass':  return 'rgba(255,255,255,0.85)';
      default:       return '#f1f5f9';
    }
  })();

  const cardBg      = isDark ? '#1e293b' : '#ffffff';
  const textColor   = isDark ? '#f1f5f9' : '#1e293b';
  const subtextColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const chipBg      = isDark ? '#334155' : '#f1f5f9';

  // Prefer branding.bannerUrl (set by mobile/web editor), fall back to legacy coverImage
  const bannerImage = (profile as any).branding?.bannerUrl || profile.coverImage || null;
  const coverGradient = bannerImage
    ? `url(${bannerImage}) center/cover no-repeat`
    : `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}bb 100%)`;

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: pageBg }}>

      {/* ── Cover banner ────────────────────────────────── */}
      <div style={{ height: '180px', background: coverGradient }} />

      {/* ── Outer wrapper ───────────────────────────────── */}
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 16px 80px' }}>

        {/* ── Avatar row — sits ABOVE the card, no overflow clip ── */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '0 16px',
          marginTop: '-52px',
          position: 'relative',
          zIndex: 10,
        }}>
          {/* Avatar + logo badge */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar}
                alt={profile.displayName}
                width={104}
                height={104}
                style={{
                  borderRadius: '50%',
                  border: `4px solid ${cardBg}`,
                  objectFit: 'cover',
                  display: 'block',
                  width: '104px',
                  height: '104px',
                }}
              />
            ) : (
              <div style={{
                width: '104px', height: '104px',
                borderRadius: '50%',
                border: `4px solid ${cardBg}`,
                background: primaryColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '40px', fontWeight: 700,
              }}>
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            {profile.branding?.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.branding.logo}
                alt="Company logo"
                width={32}
                height={32}
                style={{
                  position: 'absolute', bottom: '2px', right: '2px',
                  borderRadius: '50%',
                  border: `2px solid ${cardBg}`,
                  background: '#fff',
                  objectFit: 'contain',
                  width: '32px',
                  height: '32px',
                }}
              />
            )}
          </div>

          {/* QR code */}
          {profile.qrCode && (
            <div style={{ textAlign: 'center', paddingBottom: '4px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.qrCode}
                alt="QR Code"
                width={68}
                height={68}
                style={{ borderRadius: '8px', border: `1px solid rgba(255,255,255,0.4)`, width: '68px', height: '68px' }}
              />
              <p style={{ fontSize: '9px', color: '#fff', marginTop: '3px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Scan to save</p>
            </div>
          )}
        </div>

        {/* ── Card body ────────────────────────────────────── */}
        <div style={{
          background: cardBg,
          borderRadius: '24px',
          border: `1px solid ${borderColor}`,
          boxShadow: isDark
            ? '0 25px 50px rgba(0,0,0,0.5)'
            : '0 25px 50px rgba(0,0,0,0.12)',
          marginTop: '-52px',
          paddingTop: '68px',   /* clears the overlapping avatar */
          padding: '68px 28px 28px',
        }}>

          {/* Name & title */}
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: textColor, margin: 0, lineHeight: 1.2 }}>
              {profile.displayName}
            </h1>
            {profile.title && (
              <p style={{ fontSize: '15px', color: subtextColor, marginTop: '4px' }}>{profile.title}</p>
            )}
            {profile.company && (
              <p style={{ fontSize: '14px', fontWeight: 600, color: primaryColor, marginTop: '2px' }}>
                {profile.company}
              </p>
            )}
            {profile.bio && (
              <p style={{ fontSize: '14px', color: subtextColor, marginTop: '10px', lineHeight: '1.6' }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Contact chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {profile.contactInfo?.email && (
              <a href={`mailto:${profile.contactInfo.email}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '12px',
                  background: chipBg, color: textColor,
                  textDecoration: 'none', fontSize: '13px', fontWeight: 500,
                }}>
                ✉️ Email
              </a>
            )}
            {profile.contactInfo?.phone && (
              <a href={`tel:${profile.contactInfo.phone}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '12px',
                  background: chipBg, color: textColor,
                  textDecoration: 'none', fontSize: '13px', fontWeight: 500,
                }}>
                📱 Call
              </a>
            )}
            {profile.contactInfo?.linkedin && (
              <a href={profile.contactInfo.linkedin} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '12px',
                  background: chipBg, color: textColor,
                  textDecoration: 'none', fontSize: '13px', fontWeight: 500,
                }}>
                💼 LinkedIn
              </a>
            )}
            {profile.contactInfo?.twitter && (
              <a href={profile.contactInfo.twitter} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '12px',
                  background: chipBg, color: textColor,
                  textDecoration: 'none', fontSize: '13px', fontWeight: 500,
                }}>
                🐦 Twitter
              </a>
            )}
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {profile.aiConfig?.enabled && (
              <button style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                background: primaryColor, color: '#fff',
                border: 'none', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              }}>
                💬 Chat with AI Secretary
              </button>
            )}
            <a href={`/book/${profile.username}`}
              style={{
                display: 'block', width: '100%', padding: '14px', borderRadius: '14px',
                border: `2px solid ${primaryColor}`, color: primaryColor,
                textAlign: 'center', textDecoration: 'none',
                fontSize: '15px', fontWeight: 600, boxSizing: 'border-box',
              }}>
              📅 Book a Meeting
            </a>
            <SaveContactModal
              username={profile.username}
              ownerName={profile.displayName}
              primaryColor={primaryColor}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Powered by */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: subtextColor }}>
          Powered by <span style={{ fontWeight: 700, color: primaryColor }}>LynQ</span>
        </p>
      </div>

      {/* AI Chat Widget */}
      {profile.aiConfig?.enabled && (
        <ModernChatWidget
          profileId={profile._id?.toString() || ''}
          greeting={profile.aiConfig.greeting}
          primaryColor={primaryColor}
          assistantName="AI Secretary"
        />
      )}
    </div>
  );
}
