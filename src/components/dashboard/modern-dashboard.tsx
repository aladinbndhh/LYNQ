'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  Eye, Users, Calendar, TrendingUp, TrendingDown,
  UserCircle, FileText, CalendarCheck, Settings,
  BarChart3, Mail, ArrowRight, Sparkles,
  CreditCard, Zap, LogOut, ChevronDown,
} from 'lucide-react';

interface DashboardStats {
  profiles: number;
  leads: { total: number; thisMonth: number; changePercent: number; byStatus: Record<string, number> };
  meetings: { total: number; upcoming: number; thisMonth: number; changePercent: number };
  views: { total: number; thisMonth: number; changePercent: number };
  recentActivity: { _id: string; count: number }[];
}

interface ModernDashboardProps {
  userName: string;
  userEmail?: string;
  userAvatar?: string;
}

function StatCard({ title, value, sub, changePercent, icon, color }: {
  title: string; value: string; sub?: string; changePercent?: number; icon: React.ReactNode; color: string;
}) {
  const up = changePercent !== undefined && changePercent >= 0;
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center`} style={{ background: color + '20' }}>
          <span style={{ color }}>{icon}</span>
        </div>
        {changePercent !== undefined && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 px-2 py-1 rounded-full ${up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(changePercent)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-extrabold text-foreground">{value}</p>
      <p className="text-sm font-medium text-muted-foreground mt-1">{title}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function QuickAction({ title, description, icon, href, color }: {
  title: string; description: string; icon: React.ReactNode; href: string; color: string;
}) {
  return (
    <Link href={href} className="group bg-card border border-border rounded-2xl p-5 flex items-start gap-4 hover:border-primary/40 hover:shadow-md transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`} style={{ background: color + '20' }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
    </Link>
  );
}

export function ModernDashboard({ userName, userEmail, userAvatar }: ModernDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();

  const statCards = stats
    ? [
        {
          title: 'Profile Views', value: fmt(stats.views.total),
          sub: `${fmt(stats.views.thisMonth)} this month`,
          changePercent: stats.views.changePercent,
          icon: <Eye className="w-5 h-5" />, color: '#3b82f6',
        },
        {
          title: 'Leads Captured', value: fmt(stats.leads.total),
          sub: `${fmt(stats.leads.thisMonth)} this month`,
          changePercent: stats.leads.changePercent,
          icon: <Users className="w-5 h-5" />, color: '#8b5cf6',
        },
        {
          title: 'Meetings Booked', value: fmt(stats.meetings.total),
          sub: `${stats.meetings.upcoming} upcoming`,
          changePercent: stats.meetings.changePercent,
          icon: <Calendar className="w-5 h-5" />, color: '#10b981',
        },
        {
          title: 'Business Cards', value: stats.profiles.toString(),
          sub: 'Active profiles',
          icon: <CreditCard className="w-5 h-5" />, color: '#f59e0b',
        },
      ]
    : [];

  const quickActions = [
    { title: 'Business Cards', description: 'Create and customize your digital cards', icon: <CreditCard className="w-5 h-5" />, href: '/dashboard/profiles', color: '#3b82f6' },
    { title: 'Leads', description: 'View and manage captured leads', icon: <FileText className="w-5 h-5" />, href: '/dashboard/leads', color: '#8b5cf6' },
    { title: 'Meetings', description: 'Schedule and track appointments', icon: <CalendarCheck className="w-5 h-5" />, href: '/dashboard/meetings', color: '#10b981' },
    { title: 'Analytics', description: 'Track engagement and performance', icon: <BarChart3 className="w-5 h-5" />, href: '/dashboard/analytics', color: '#f59e0b' },
    { title: 'Email Signature', description: 'Build branded email signatures', icon: <Mail className="w-5 h-5" />, href: '/dashboard/email-signature', color: '#ec4899' },
    { title: 'Billing', description: 'Manage subscription and usage', icon: <Zap className="w-5 h-5" />, href: '/dashboard/billing', color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">
              LynQ
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Cards', href: '/dashboard/profiles' },
              { label: 'Leads', href: '/dashboard/leads' },
              { label: 'Analytics', href: '/dashboard/analytics' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {userAvatar ? (
                  <img src={userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
              <span className="hidden md:block text-sm font-medium text-foreground max-w-[120px] truncate">
                {userName}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                    {userEmail && <p className="text-xs text-muted-foreground truncate">{userEmail}</p>}
                  </div>
                  <Link href="/dashboard/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors">
                    <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                  </Link>
                  <Link href="/dashboard/billing" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors">
                    <Zap className="w-4 h-4 text-muted-foreground" /> Billing
                  </Link>
                  <div className="border-t border-border">
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">
            Welcome back, {userName.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            {loading ? 'Loading your stats…' : "Here's what's happening with your account today."}
          </p>
        </div>

        {/* Stats grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                <div className="w-11 h-11 bg-muted rounded-xl mb-4" />
                <div className="h-8 bg-muted rounded w-16 mb-2" />
                <div className="h-4 bg-muted rounded w-24" />
              </div>
            ))}
          </div>
        ) : stats && stats.leads.total === 0 && stats.views.total === 0 && stats.meetings.total === 0 && stats.profiles === 0 ? (
          // Empty state for new accounts
          <div className="bg-card border border-border rounded-2xl p-8 mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Welcome to LynQ!</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You're all set. Create your first digital business card to start capturing leads and booking meetings.
            </p>
            <Link
              href="/dashboard/profiles"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Create Your First Card <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s) => <StatCard key={s.title} {...s} />)}
          </div>
        )}

        {/* Lead status breakdown */}
        {stats && stats.leads.total > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground">Lead Pipeline</h2>
              <Link href="/dashboard/leads" className="text-xs text-primary font-medium hover:underline">View all →</Link>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'new', label: 'New', color: '#3b82f6' },
                { key: 'contacted', label: 'Contacted', color: '#8b5cf6' },
                { key: 'qualified', label: 'Qualified', color: '#10b981' },
                { key: 'converted', label: 'Converted', color: '#f59e0b' },
                { key: 'lost', label: 'Lost', color: '#94a3b8' },
              ].map(({ key, label, color }) => {
                const count = stats.leads.byStatus[key] || 0;
                const pct = stats.leads.total > 0 ? Math.round((count / stats.leads.total) * 100) : 0;
                return (
                  <div key={key} className="flex-1 min-w-[80px]">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{label}</span><span>{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map((a) => <QuickAction key={a.href} {...a} />)}
          </div>
        </div>

        {/* Feature banner */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-semibold text-white/80 uppercase tracking-wide">Pro Feature</span>
              </div>
              <h3 className="text-2xl font-extrabold mb-2">Custom Domain + White Label</h3>
              <p className="text-white/80 text-sm max-w-md">
                Host your digital cards on your own domain. Remove all LynQ branding and make it truly yours.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link href="/dashboard/billing" className="px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl text-sm hover:bg-white/90 transition-colors">
                Upgrade Now
              </Link>
              <Link href="/dashboard/profiles" className="px-5 py-2.5 bg-white/20 text-white font-semibold rounded-xl text-sm hover:bg-white/30 transition-colors">
                View Cards
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
