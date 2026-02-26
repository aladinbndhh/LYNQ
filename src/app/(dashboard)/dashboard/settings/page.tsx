'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                LynQ
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600 mt-2">Manage your account and integrations</p>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Your Company"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Save Changes
              </button>
            </div>
          </div>

          {/* Calendar Integration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Calendar Integration</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    📅
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Google Calendar</div>
                    <div className="text-sm text-gray-500">Smart scheduling</div>
                  </div>
                </div>
                <Link href="/dashboard/integrations/google-calendar" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Configure
                </Link>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    📧
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Outlook Calendar</div>
                    <div className="text-sm text-gray-500">Microsoft 365 sync</div>
                  </div>
                </div>
                <Link href="/dashboard/integrations/outlook-calendar" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Configure
                </Link>
              </div>
            </div>
          </div>

          {/* Odoo Integration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Odoo Integration</h3>
            <p className="text-sm text-gray-600 mb-4">
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
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Email Signature</h3>
            <p className="text-sm text-gray-600 mb-4">
              Generate a professional email signature with your profile and company logo badge
            </p>
            <Link
              href="/dashboard/email-signature"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Generate Signature
            </Link>
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Subscription</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">Free Plan</div>
                <div className="text-sm text-gray-600 mt-1">100 AI messages / month</div>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-lg hover:from-indigo-600 hover:to-rose-600 transition-colors font-semibold">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
