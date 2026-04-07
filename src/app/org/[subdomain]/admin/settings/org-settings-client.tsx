'use client';

import { useEffect, useState } from 'react';

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'lynq.cards';

export function OrgSettingsClient() {
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/org');
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setName(data.data.name || '');
        setSubdomain(data.data.subdomain || '');
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      const res = await fetch('/api/org', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          subdomain: subdomain.trim() || null,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      setOk('Saved. If you changed the subdomain, use the new URL after DNS is ready.');
      if (data.data?.subdomain && data.data.subdomain !== subdomain) {
        setSubdomain(data.data.subdomain);
      }
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <form onSubmit={save} className="max-w-lg space-y-6">
      {err && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm px-4 py-3">
          {err}
        </div>
      )}
      {ok && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-3">
          {ok}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1.5">Organisation name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Subdomain</label>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="your-company"
            className="flex-1 min-w-[160px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <span className="text-sm text-muted-foreground">.{ROOT}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Add <code className="text-primary">*.{ROOT}</code> in Vercel → Domains, then point DNS for your
          wildcard host. Leave empty to disable the public org URL until you’re ready.
        </p>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
