'use client';

import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">
                LynQ
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground mt-2">Manage your account and integrations</p>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Your Company"
                  className="w-full px-4 py-2 border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                Save Changes
              </button>
            </div>
          </div>

          {/* Calendar Integration */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Calendar Integration</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                    📅
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Google Calendar</div>
                    <div className="text-sm text-muted-foreground">Smart scheduling</div>
                  </div>
                </div>
                <Link href="/dashboard/integrations/google-calendar" className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">
                  Configure
                </Link>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    📧
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Outlook Calendar</div>
                    <div className="text-sm text-muted-foreground">Microsoft 365 sync</div>
                  </div>
                </div>
                <Link href="/dashboard/integrations/outlook-calendar" className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">
                  Configure
                </Link>
              </div>
            </div>
          </div>

          {/* Odoo Integration */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Odoo Integration</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect to your Odoo instance for CRM and calendar sync
            </p>
            <Link
              href="/dashboard/integrations/odoo"
              className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-lg hover:from-indigo-600 hover:to-rose-600 transition-colors font-semibold"
            >
              Configure Odoo
            </Link>
          </div>

          {/* Email Signature */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Email Signature</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate a professional email signature with your profile and company logo badge
            </p>
            <Link
              href="/dashboard/email-signature"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              Generate Signature
            </Link>
          </div>

          {/* Subscription */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Subscription</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">Free Plan</div>
                <div className="text-sm text-muted-foreground mt-1">100 AI messages / month</div>
              </div>
              <Link
                href="/dashboard/billing"
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-lg hover:from-indigo-600 hover:to-rose-600 transition-colors font-semibold"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
