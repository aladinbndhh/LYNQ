'use client';

import { useCallback, useEffect, useState } from 'react';

type UserRow = {
  _id: string;
  email: string;
  name: string;
  role: string;
  emailVerified?: boolean;
};

type InviteRow = {
  _id: string;
  email: string;
  role: string;
  expiresAt: string;
};

export function OrgTeamClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const [u, i] = await Promise.all([
        fetch('/api/org/users').then((r) => r.json()),
        fetch('/api/org/invitations').then((r) => r.json()),
      ]);
      if (!u.success) throw new Error(u.error || 'Failed to load users');
      if (!i.success) throw new Error(i.error || 'Failed to load invites');
      setUsers(u.data || []);
      setInvites(i.data || []);
    } catch (e: any) {
      setErr(e.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch('/api/org/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Invite failed');
      setEmail('');
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelInvite(id: string) {
    if (!confirm('Cancel this invitation?')) return;
    const res = await fetch(`/api/org/invitations/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) {
      setErr(data.error || 'Could not cancel');
      return;
    }
    await load();
  }

  async function patchRole(userId: string, newRole: 'admin' | 'user') {
    const res = await fetch(`/api/org/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    if (!data.success) {
      setErr(data.error || 'Update failed');
      return;
    }
    await load();
  }

  async function removeUser(userId: string) {
    if (!confirm('Remove this user from the organisation?')) return;
    const res = await fetch(`/api/org/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) {
      setErr(data.error || 'Remove failed');
      return;
    }
    await load();
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-10">
      {err && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm px-4 py-3">
          {err}
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">Invite teammate</h2>
        <form onSubmit={sendInvite} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="email"
            required
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="user">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? 'Sending…' : 'Send invite'}
          </button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          They’ll get an email with a link to create their LynQ account and join this organisation.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Pending invitations</h2>
        {invites.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending invites.</p>
        ) : (
          <ul className="space-y-2">
            {invites.map((inv) => (
              <li
                key={inv._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm"
              >
                <span>
                  {inv.email}{' '}
                  <span className="text-muted-foreground">({inv.role})</span>
                </span>
                <button
                  type="button"
                  onClick={() => cancelInvite(inv._id)}
                  className="text-destructive text-xs font-medium hover:underline"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Members</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-border">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => patchRole(u._id, e.target.value as 'admin' | 'user')}
                      className="rounded border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value="user">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => removeUser(u._id)}
                      className="text-destructive text-xs font-medium hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
