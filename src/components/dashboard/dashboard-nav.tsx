'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Settings, Zap, LogOut, ChevronDown,
  LayoutDashboard, Users, BarChart3, CalendarCheck,
  CreditCard, Mail, Menu, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardNavProps {
  userName: string;
  userEmail?: string;
  userAvatar?: string;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Cards', href: '/dashboard/profiles', icon: CreditCard },
  { label: 'Leads', href: '/dashboard/leads', icon: Users },
  { label: 'Meetings', href: '/dashboard/meetings', icon: CalendarCheck },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Email Sig', href: '/dashboard/email-signature', icon: Mail },
];

export function DashboardNav({ userName, userEmail, userAvatar }: DashboardNavProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <img src="/logo.png" alt="LynQ" className="w-9 h-9 object-contain" />
          <span className="text-lg font-extrabold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">
            LynQ
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive(href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Billing shortcut */}
          <Link
            href="/dashboard/billing"
            className={cn(
              'hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              isActive('/dashboard/billing')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <Zap className="w-4 h-4" />
            Billing
          </Link>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
              <span className="hidden md:block text-sm font-medium text-foreground max-w-[110px] truncate">
                {userName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                    {userEmail && <p className="text-xs text-muted-foreground truncate">{userEmail}</p>}
                  </div>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                  </Link>
                  <Link
                    href="/dashboard/billing"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Zap className="w-4 h-4 text-muted-foreground" /> Billing
                  </Link>
                  <div className="border-t border-border">
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
          {[...NAV_ITEMS, { label: 'Billing', href: '/dashboard/billing', icon: Zap }, { label: 'Settings', href: '/dashboard/settings', icon: Settings }].map(
            ({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive(href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            )
          )}
          <div className="border-t border-border pt-2 mt-2">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
