'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PLANS } from '@/lib/plans';

interface TenantInfo {
  subscriptionTier: 'free' | 'solo' | 'business';
  userCount: number;
  aiUsageCount: number;
  aiUsageLimit: number;
}

function BillingContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');

  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [businessUsers, setBusinessUsers] = useState(5);

  useEffect(() => { fetchTenant(); }, []);

  const fetchTenant = async () => {
    try {
      const res = await fetch('/api/billing/status');
      const data = await res.json();
      if (data.success) {
        setTenant(data.data);
        if (data.data.userCount > 1) setBusinessUsers(data.data.userCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: 'solo' | 'business') => {
    setUpgrading(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userCount: plan === 'business' ? businessUsers : 1,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout');
      }
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    } finally {
      setUpgrading(null);
    }
  };

  const handleManageBilling = async () => {
    setOpeningPortal(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to open billing portal');
      }
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    } finally {
      setOpeningPortal(false);
    }
  };

  const currentTier = tenant?.subscriptionTier ?? 'free';
  const businessTotal = businessUsers * PLANS.business.price;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Billing &amp; Plans</h1>
          <p className="text-muted-foreground">Choose the plan that fits your team</p>
        </div>

        {/* Banners */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl flex items-center gap-3">
            <span className="text-xl">🎉</span>
            Your subscription was activated successfully! Your plan has been updated.
          </div>
        )}
        {cancelled && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl flex items-center gap-3">
            <span className="text-xl">↩</span>
            Checkout was cancelled. Your plan has not changed.
          </div>
        )}

        {/* Current plan summary */}
        {tenant && currentTier !== 'free' && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current plan</p>
              <p className="text-2xl font-bold text-foreground capitalize">
                {currentTier === 'business'
                  ? `Business · ${tenant.userCount} user${tenant.userCount !== 1 ? 's' : ''}`
                  : 'Solo'}
              </p>
              {currentTier === 'business' && (
                <p className="text-sm text-muted-foreground mt-1">
                  QAR {PLANS.business.price} × {tenant.userCount} = QAR {PLANS.business.price * tenant.userCount}/month
                </p>
              )}
              {currentTier === 'solo' && (
                <p className="text-sm text-muted-foreground mt-1">QAR {PLANS.solo.price}/month</p>
              )}
            </div>
            <button
              onClick={handleManageBilling}
              disabled={openingPortal}
              className="px-5 py-2.5 text-sm font-semibold text-primary border border-primary/30 rounded-xl hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {openingPortal ? 'Opening…' : 'Manage Billing'}
            </button>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* ── Solo ─────────────────────────────────────────────────────── */}
          <div className={`bg-card rounded-2xl border-2 p-7 flex flex-col transition-colors ${
            currentTier === 'solo' ? 'border-primary' : 'border-border'
          }`}>
            {currentTier === 'solo' && (
              <span className="self-start text-xs font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full mb-4">
                Current Plan
              </span>
            )}
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-foreground">{PLANS.solo.name}</h2>
              <p className="text-muted-foreground text-sm mt-1">{PLANS.solo.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-foreground">QAR {PLANS.solo.price}</span>
                <span className="text-muted-foreground text-sm ml-1">/month</span>
              </div>
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {PLANS.solo.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="text-green-400 mt-0.5 text-base">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {currentTier === 'solo' ? (
              <button
                onClick={handleManageBilling}
                disabled={openingPortal}
                className="w-full py-3 rounded-xl font-semibold border-2 border-primary text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                {openingPortal ? 'Opening…' : 'Manage Subscription'}
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade('solo')}
                disabled={upgrading === 'solo'}
                className="w-full py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {upgrading === 'solo' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Redirecting…
                  </span>
                ) : (
                  `Get Solo — QAR ${PLANS.solo.price}/mo`
                )}
              </button>
            )}
          </div>

          {/* ── Business ─────────────────────────────────────────────────── */}
          <div className={`bg-card rounded-2xl border-2 p-7 flex flex-col transition-colors relative overflow-hidden ${
            currentTier === 'business' ? 'border-primary' : 'border-border'
          }`}>
            {/* Popular badge */}
            {currentTier !== 'business' && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-rose-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                MOST POPULAR
              </div>
            )}
            {currentTier === 'business' && (
              <span className="self-start text-xs font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full mb-4">
                Current Plan
              </span>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-foreground">{PLANS.business.name}</h2>
              <p className="text-muted-foreground text-sm mt-1">{PLANS.business.description}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-foreground">QAR {PLANS.business.price}</span>
                <span className="text-muted-foreground text-sm mb-1">/user/month</span>
              </div>
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
              {PLANS.business.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="text-green-400 mt-0.5 text-base">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* User count selector */}
            {currentTier !== 'business' && (
              <div className="mb-5 p-4 bg-secondary rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-foreground">Number of users</label>
                  <span className="text-sm font-bold text-primary">{businessUsers} users</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={100}
                  value={businessUsers}
                  onChange={(e) => setBusinessUsers(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>2</span>
                  <span>50</span>
                  <span>100</span>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total / month</span>
                  <span className="text-lg font-extrabold text-foreground">QAR {businessTotal}</span>
                </div>
              </div>
            )}

            {/* Manage or upgrade button */}
            {currentTier === 'business' ? (
              <div className="space-y-3">
                <div className="p-4 bg-secondary rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-foreground">Change seats</label>
                    <span className="text-sm font-bold text-primary">{businessUsers} users</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={100}
                    value={businessUsers}
                    onChange={(e) => setBusinessUsers(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>2</span><span>50</span><span>100</span>
                  </div>
                </div>
                <button
                  onClick={handleManageBilling}
                  disabled={openingPortal}
                  className="w-full py-3 rounded-xl font-semibold border-2 border-primary text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  {openingPortal ? 'Opening…' : 'Manage Subscription'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleUpgrade('business')}
                disabled={upgrading === 'business'}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all disabled:opacity-50"
              >
                {upgrading === 'business' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Redirecting…
                  </span>
                ) : (
                  `Get Business — QAR ${businessTotal}/mo`
                )}
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Common questions</h2>
          {[
            {
              q: 'Can I switch from Solo to Business?',
              a: 'Yes. Click "Manage Billing" and you can upgrade, downgrade, or cancel anytime. Stripe prorates the difference automatically.',
            },
            {
              q: 'How does Business billing work?',
              a: `You choose the number of seats and pay QAR ${PLANS.business.price} per user per month. You can add or remove seats at any time via the billing portal.`,
            },
            {
              q: 'What happens if I cancel?',
              a: 'Your account downgrades to a free read-only mode at the end of the billing period. All your data is kept.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-card border border-border rounded-xl p-5">
              <p className="font-semibold text-foreground mb-1">{q}</p>
              <p className="text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BillingContent />
    </Suspense>
  );
}
