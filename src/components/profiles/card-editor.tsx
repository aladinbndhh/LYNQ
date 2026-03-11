'use client';

import * as React from 'react';
import { IProfile } from '@/types';

type Theme = 'light' | 'dark' | 'gradient' | 'glass' | 'neon';

interface CardEditorProps {
  profile: Partial<IProfile>;
  onChange: (updated: Partial<IProfile>) => void;
}

const THEMES: { id: Theme; label: string; preview: string }[] = [
  { id: 'light', label: 'Light', preview: '#f8fafc' },
  { id: 'dark', label: 'Dark', preview: '#0f172a' },
  { id: 'gradient', label: 'Gradient', preview: 'linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%)' },
  { id: 'glass', label: 'Glass', preview: 'rgba(255,255,255,0.7)' },
  { id: 'neon', label: 'Neon', preview: '#020617' },
];

const PRESET_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#10b981',
  '#f59e0b', '#ef4444', '#14b8a6', '#1e293b',
];

export function CardEditor({ profile, onChange }: CardEditorProps) {
  const theme = (profile.branding?.theme || 'light') as Theme;
  const primaryColor = profile.branding?.primaryColor || '#3b82f6';
  const isDark = theme === 'dark' || theme === 'neon';

  const set = (patch: Partial<IProfile>) => onChange({ ...profile, ...patch });
  const setBranding = (patch: Partial<NonNullable<IProfile['branding']>>) =>
    set({ branding: { ...profile.branding!, ...patch } });
  const setContact = (patch: Partial<NonNullable<IProfile['contactInfo']>>) =>
    set({ contactInfo: { ...profile.contactInfo, ...patch } });
  const setAi = (patch: Partial<NonNullable<IProfile['aiConfig']>>) =>
    set({ aiConfig: { ...profile.aiConfig!, ...patch } });

  // Phone mockup background
  const mockupBg = (() => {
    switch (theme) {
      case 'dark': return '#0f172a';
      case 'neon': return '#020617';
      case 'gradient': return `linear-gradient(135deg, ${primaryColor}33, ${primaryColor}66)`;
      case 'glass': return 'rgba(255,255,255,0.15)';
      default: return '#f8fafc';
    }
  })();

  const cardBg = isDark ? '#1e293b' : '#fff';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const subText = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Editor panel */}
      <div className="space-y-5">
        {/* Theme */}
        <section className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Card Theme</p>
          <div className="flex gap-2 flex-wrap">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setBranding({ theme: t.id })}
                title={t.label}
                className={`relative w-12 h-12 rounded-xl border-2 transition-all ${
                  theme === t.id ? 'border-blue-500 scale-110' : 'border-border'
                }`}
                style={{ background: t.preview }}
              >
                {theme === t.id && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-white text-[9px] flex items-center justify-center">✓</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap mt-2">
            {THEMES.map((t) => (
              <span key={t.id} className="text-[10px] text-muted-foreground w-12 text-center">{t.label}</span>
            ))}
          </div>
        </section>

        {/* Brand color */}
        <section className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Brand Color</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setBranding({ primaryColor: c })}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: c,
                  borderColor: primaryColor === c ? '#fff' : 'transparent',
                  boxShadow: primaryColor === c ? `0 0 0 2px ${c}` : 'none',
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setBranding({ primaryColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setBranding({ primaryColor: e.target.value })}
              className="flex-1 text-sm border border-border rounded-lg px-2 py-1 font-mono bg-background text-foreground"
            />
          </div>
        </section>

        {/* Profile info */}
        <section className="bg-card border border-border rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Profile Info</p>
          {[
            { label: 'Display Name', key: 'displayName' as keyof IProfile, type: 'text' },
            { label: 'Job Title', key: 'title' as keyof IProfile, type: 'text' },
            { label: 'Company', key: 'company' as keyof IProfile, type: 'text' },
            { label: 'Bio', key: 'bio' as keyof IProfile, type: 'textarea' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
              {type === 'textarea' ? (
                <textarea
                  value={(profile[key] as string) || ''}
                  onChange={(e) => set({ [key]: e.target.value })}
                  rows={2}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={(profile[key] as string) || ''}
                  onChange={(e) => set({ [key]: e.target.value })}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground"
                />
              )}
            </div>
          ))}
        </section>

        {/* Contact info */}
        <section className="bg-card border border-border rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Contact Links</p>
          {[
            { label: 'Email', key: 'email', placeholder: 'you@company.com' },
            { label: 'Phone', key: 'phone', placeholder: '+1 555 000 0000' },
            { label: 'LinkedIn URL', key: 'linkedin', placeholder: 'https://linkedin.com/in/...' },
            { label: 'Twitter URL', key: 'twitter', placeholder: 'https://twitter.com/...' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
              <input
                type="text"
                value={(profile.contactInfo as any)?.[key] || ''}
                onChange={(e) => setContact({ [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground"
              />
            </div>
          ))}
        </section>

        {/* AI Secretary */}
        <section className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">AI Secretary</p>
            <div
              onClick={() => setAi({ enabled: !profile.aiConfig?.enabled })}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${profile.aiConfig?.enabled ? 'bg-blue-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${profile.aiConfig?.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </div>
          {profile.aiConfig?.enabled && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Greeting Message</label>
              <input
                type="text"
                value={profile.aiConfig?.greeting || ''}
                onChange={(e) => setAi({ greeting: e.target.value })}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground"
                placeholder="Hello! How can I help you today?"
              />
            </div>
          )}
        </section>
      </div>

      {/* Phone mockup preview */}
      <div className="flex flex-col items-center sticky top-6">
        <p className="text-sm font-semibold text-foreground mb-4">Live Preview</p>
        <div
          style={{
            width: '280px',
            height: '580px',
            borderRadius: '36px',
            border: '8px solid #1e293b',
            boxShadow: '0 40px 80px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.1)',
            overflow: 'hidden',
            position: 'relative',
            background: mockupBg,
          }}
        >
          {/* Notch */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80px', height: '24px', background: '#1e293b', borderRadius: '0 0 16px 16px', zIndex: 10 }} />

          {/* Cover */}
          <div
            style={{
              height: '130px',
              background: profile.coverImage
                ? `url(${profile.coverImage}) center/cover`
                : `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}bb 100%)`,
            }}
          />

          {/* Card */}
          <div style={{ margin: '0 12px', borderRadius: '16px', background: cardBg, marginTop: '-40px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden', paddingBottom: '12px' }}>
            <div style={{ padding: '0 16px' }}>
              {/* Avatar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-30px', marginBottom: '10px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: primaryColor, border: `3px solid ${cardBg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', fontWeight: 700 }}>
                  {(profile.displayName || 'U').charAt(0).toUpperCase()}
                </div>
                {profile.qrCode && (
                  <img src={profile.qrCode} alt="QR" style={{ width: '44px', height: '44px', borderRadius: '6px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }} />
                )}
              </div>

              {/* Name */}
              <div style={{ fontSize: '15px', fontWeight: 700, color: textColor }}>{profile.displayName || 'Your Name'}</div>
              {profile.title && <div style={{ fontSize: '11px', color: subText, marginTop: '2px' }}>{profile.title}</div>}
              {profile.company && <div style={{ fontSize: '11px', fontWeight: 600, color: primaryColor, marginTop: '1px' }}>{profile.company}</div>}
              {profile.bio && <div style={{ fontSize: '10px', color: subText, marginTop: '6px', lineHeight: 1.5 }}>{profile.bio.slice(0, 60)}{profile.bio.length > 60 ? '…' : ''}</div>}

              {/* Contact chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                {profile.contactInfo?.email && (
                  <span style={{ fontSize: '9px', padding: '3px 8px', borderRadius: '8px', background: isDark ? '#334155' : '#f1f5f9', color: textColor }}>✉️ Email</span>
                )}
                {profile.contactInfo?.phone && (
                  <span style={{ fontSize: '9px', padding: '3px 8px', borderRadius: '8px', background: isDark ? '#334155' : '#f1f5f9', color: textColor }}>📱 Call</span>
                )}
                {profile.contactInfo?.linkedin && (
                  <span style={{ fontSize: '9px', padding: '3px 8px', borderRadius: '8px', background: isDark ? '#334155' : '#f1f5f9', color: textColor }}>💼 LinkedIn</span>
                )}
              </div>

              {/* CTA buttons */}
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {profile.aiConfig?.enabled && (
                  <div style={{ background: primaryColor, borderRadius: '10px', padding: '7px 12px', fontSize: '10px', fontWeight: 600, color: '#fff', textAlign: 'center' }}>
                    💬 Chat with AI Secretary
                  </div>
                )}
                <div style={{ border: `1.5px solid ${primaryColor}`, borderRadius: '10px', padding: '7px 12px', fontSize: '10px', fontWeight: 600, color: primaryColor, textAlign: 'center' }}>
                  📅 Book a Meeting
                </div>
              </div>
            </div>
          </div>

          {/* Powered by */}
          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '9px', color: subText }}>
            Powered by <span style={{ fontWeight: 700, color: primaryColor }}>LynQ</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">Preview updates in real-time</p>
      </div>
    </div>
  );
}
