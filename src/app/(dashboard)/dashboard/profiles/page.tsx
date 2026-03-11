'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IProfile } from '@/types';
import { CardEditor } from '@/components/profiles/card-editor';

type View = 'list' | 'create' | 'edit';

const EMPTY_PROFILE: Partial<IProfile> = {
  displayName: '',
  username: '',
  title: '',
  company: '',
  bio: '',
  branding: { primaryColor: '#3b82f6', logo: '', theme: 'light' },
  contactInfo: {},
  aiConfig: { enabled: true, personality: 'professional and friendly', greeting: 'Hello! How can I help you today?', qualificationQuestions: [], autoBooking: true },
  isPublic: true,
  language: 'en',
  timezone: 'UTC',
};

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<IProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<View>('list');
  const [editProfile, setEditProfile] = useState<Partial<IProfile>>(EMPTY_PROFILE);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => { fetchProfiles(); }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      if (data.success) setProfiles(data.data);
      else setError(data.error || 'Failed to fetch profiles');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editProfile.displayName || !editProfile.username) {
      setError('Display name and username are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const url = editId ? `/api/profiles/${editId}` : '/api/profiles';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfile),
      });
      const data = await res.json();
      if (data.success) {
        await fetchProfiles();
        setView('list');
        setEditId(null);
        setEditProfile(EMPTY_PROFILE);
      } else {
        setError(data.error || 'Failed to save profile');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this profile? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) setProfiles((p) => p.filter((x) => String(x._id) !== id));
      else alert(data.error || 'Failed to delete');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startEdit = (profile: IProfile) => {
    setEditId(String(profile._id));
    setEditProfile({ ...profile });
    setView('edit');
    setError('');
  };

  const startCreate = () => {
    setEditId(null);
    setEditProfile({ ...EMPTY_PROFILE });
    setView('create');
    setError('');
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (view === 'create' || view === 'edit') {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">
                LynQ
              </Link>
              <button onClick={() => { setView('list'); setError(''); }} className="text-muted-foreground hover:text-foreground text-sm">
                ← Back to Cards
              </button>
            </div>
            <div className="flex items-center gap-3">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={() => { setView('list'); setError(''); }}
                className="px-4 py-2 text-sm border border-border rounded-xl text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm font-semibold rounded-xl text-white transition-colors disabled:opacity-50"
                style={{ background: '#3b82f6' }}
              >
                {saving ? 'Saving…' : view === 'edit' ? 'Save Changes' : 'Create Card'}
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              {view === 'edit' ? 'Edit Business Card' : 'Create Business Card'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Customize your digital card — changes reflect in the live preview instantly
            </p>
          </div>

          {/* Username field */}
          {view === 'create' && (
            <div className="bg-card border border-border rounded-xl p-4 mb-6 flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Card URL slug (unique)</label>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground text-sm">{appUrl || 'https://app.lynq.io'}/</span>
                  <input
                    type="text"
                    value={editProfile.username || ''}
                    onChange={(e) => setEditProfile({ ...editProfile, username: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                    placeholder="your-name"
                    className="flex-1 text-sm border-b border-border bg-transparent py-1 text-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <CardEditor
            profile={editProfile}
            onChange={(updated) => setEditProfile(updated)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">
              LynQ
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground text-sm">
              Dashboard
            </Link>
          </div>
          <button
            onClick={startCreate}
            className="px-5 py-2 text-sm font-semibold rounded-xl text-white"
            style={{ background: '#3b82f6' }}
          >
            + New Card
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Your Business Cards</h1>
          <p className="text-muted-foreground mt-1">Create and manage your digital business cards</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {profiles.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-16 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No business cards yet</h3>
            <p className="text-muted-foreground mb-6">Create your first digital business card and share it with the world.</p>
            <button
              onClick={startCreate}
              className="px-6 py-3 rounded-xl font-semibold text-white"
              style={{ background: '#3b82f6' }}
            >
              Create Your First Card
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {profiles.map((profile) => {
              const primaryColor = profile.branding?.primaryColor || '#3b82f6';
              const cardUrl = `${appUrl}/${profile.username}`;
              const isDark = profile.branding?.theme === 'dark' || profile.branding?.theme === 'neon';
              return (
                <div
                  key={String(profile._id)}
                  className="bg-card rounded-2xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  style={{ borderColor: primaryColor }}
                >
                  {/* Cover */}
                  <div
                    className="h-20"
                    style={{
                      background: profile.coverImage
                        ? `url(${profile.coverImage}) center/cover`
                        : `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}bb 100%)`,
                    }}
                  />

                  <div className="px-5 pb-5">
                    {/* Avatar row */}
                    <div className="flex items-end justify-between -mt-8 mb-3">
                      <div
                        className="w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-bold text-white"
                        style={{ background: primaryColor, borderColor: 'white' }}
                      >
                        {profile.displayName.charAt(0).toUpperCase()}
                      </div>
                      {profile.qrCode && (
                        <img
                          src={profile.qrCode}
                          alt="QR"
                          className="w-12 h-12 rounded-lg border border-border"
                        />
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-foreground">{profile.displayName}</h3>
                    {profile.title && <p className="text-sm text-muted-foreground">{profile.title}</p>}
                    {profile.company && <p className="text-sm font-medium" style={{ color: primaryColor }}>{profile.company}</p>}

                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-muted-foreground truncate">{cardUrl}</span>
                    </div>

                    {/* Theme badge */}
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize"
                      style={{ background: primaryColor + '22', color: primaryColor }}>
                      {profile.branding?.theme || 'light'} theme
                    </span>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <a
                        href={cardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 text-sm font-medium text-center rounded-xl border border-border text-muted-foreground hover:bg-muted/50 transition-colors"
                      >
                        Preview
                      </a>
                      <button
                        onClick={() => startEdit(profile)}
                        className="flex-1 py-2 text-sm font-medium rounded-xl text-white transition-colors"
                        style={{ background: primaryColor }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(String(profile._id))}
                        className="py-2 px-3 text-sm rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
