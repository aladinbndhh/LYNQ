'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PLANS } from '@/lib/plans';

interface TenantInfo {
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  aiUsageCount: number;
  aiUsageLimit: number;
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');

  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    fetchTenant();
  }, []);

  const fetchTenant = async () => {
    try {
      const res = await fetch('/api/billing/status');
      const data = await res.json();
      if (data.success) setTenant(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: 'pro' | 'enterprise') => {
    setUpgrading(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
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

  const currentTier = tenant?.subscriptionTier || 'free';
  const usagePct = tenant
    ? tenant.aiUsageLimit > 0 ? Math.min((tenant.aiUsageCount / tenant.aiUsageLimit) * 100, 100) : 0
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Billing &amp; Plans</h1>
        <p className="text-muted-foreground mb-8">Manage your subscription and usage</p>

        {/* Banners */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl">
            🎉 Your subscription was activated successfully!
          </div>
        )}
        {cancelled && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl">
            Checkout was cancelled. Your plan has not changed.
          </div>
        )}

        {/* Current usage */}
        {tenant && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Current plan</p>
                <p className="text-xl font-bold text-foreground capitalize">{currentTier}</p>
              </div>
              {currentTier !== 'free' && (
                <button
                  onClick={handleManageBilling}
                  disabled={openingPortal}
                  className="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  {openingPortal ? 'Opening…' : 'Manage Billing'}
                </button>
              )}
            </div>
            <div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>AI Chats used</span>
                <span>
                  {tenant.aiUsageCount.toLocaleString()} / {tenant.aiUsageLimit === 99999 ? '∞' : tenant.aiUsageLimit.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${usagePct}%`,
                    background: usagePct > 85 ? '#ef4444' : usagePct > 60 ? '#f59e0b' : 'hsl(var(--primary))',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
            const isCurrent = key === currentTier;
            const isPaid = key === 'pro' || key === 'enterprise';
            return (
              <div
                key={key}
                className={`bg-card rounded-2xl border-2 p-6 flex flex-col transition-colors ${
                  isCurrent ? 'border-primary' : 'border-border'
                }`}
              >
                {isCurrent && (
                  <span className="self-start text-xs font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full mb-3">
                    Current Plan
                  </span>
                )}
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold text-foreground">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </>
                  )}
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {isPaid && !isCurrent && (
                  <button
                    onClick={() => handleUpgrade(key as 'pro' | 'enterprise')}
                    disabled={upgrading === key || loading}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {upgrading === key ? 'Redirecting…' : `Upgrade to ${plan.name}`}
                  </button>
                )}
                {isCurrent && key !== 'free' && (
                  <button
                    onClick={handleManageBilling}
                    disabled={openingPortal}
                    className="w-full py-3 rounded-xl font-semibold border-2 border-primary text-primary transition-colors disabled:opacity-50 hover:bg-primary/10"
                  >
                    {openingPortal ? 'Opening…' : 'Manage Subscription'}
                  </button>
                )}
                {key === 'free' && isCurrent && (
                  <div className="w-full py-3 text-center text-sm text-muted-foreground">Active</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
