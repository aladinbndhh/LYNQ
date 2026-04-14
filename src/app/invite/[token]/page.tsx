'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type OdooProfile = {
  name: string;
  title?: string;
  department?: string;
  company?: string;
  avatar?: string;
  logo?: string;
  phone?: string;
};

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [odooProfile, setOdooProfile] = useState<OdooProfile | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`/api/invite/${token}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Invalid invitation');
        setOrgName(data.data.organisationName || 'Organisation');
        setEmail(data.data.email || '');
        if (data.data.odooProfile) {
          setOdooProfile(data.data.odooProfile);
          // Pre-fill name from Odoo
          if (data.data.odooProfile.name) {
            setName(data.data.odooProfile.name);
          }
        }
      } catch (e: any) {
        setErr(e.message || 'Invalid or expired link');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Could not join');
      router.push('/login?invited=1');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (err && !orgName) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <p className="text-destructive mb-4 text-center">{err}</p>
        <Link href="/login" className="text-primary underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <img src="/logo.png" alt="" className="w-16 h-16 mb-6 object-contain" />
      <h1 className="text-2xl font-bold text-center mb-1">Join {orgName}</h1>
      <p className="text-muted-foreground text-sm mb-8 text-center">
        Create your password for <span className="text-foreground font-medium">{email}</span>
      </p>

      {/* Odoo employee preview card */}
      {odooProfile && (
        <div className="w-full max-w-sm mb-8 rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="p-4 flex gap-4 items-center">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden flex-shrink-0">
              {odooProfile.avatar ? (
                <img src={odooProfile.avatar} alt={odooProfile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-primary/10 text-primary">
                  {odooProfile.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Info + logo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm truncate">{odooProfile.name}</p>
                {odooProfile.logo && (
                  <img src={odooProfile.logo} alt="Company logo" className="h-5 object-contain flex-shrink-0" />
                )}
              </div>
              {odooProfile.title && (
                <p className="text-xs text-muted-foreground truncate">{odooProfile.title}</p>
              )}
              {odooProfile.department && (
                <p className="text-xs text-muted-foreground truncate">{odooProfile.department}</p>
              )}
              {odooProfile.company && (
                <p className="text-xs text-muted-foreground truncate">{odooProfile.company}</p>
              )}
            </div>
          </div>

          <div className="px-4 pb-4">
            <p className="text-xs text-muted-foreground italic">
              Your profile will be pre-filled from your Odoo records. You can update it after signing in.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        {err && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
            {err}
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Your name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Password (min 6 characters)</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {submitting ? 'Creating account…' : 'Join organisation'}
        </button>
      </form>

      <p className="mt-8 text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
