'use client';

import { useState } from 'react';
import { EnhancedProfileCard } from '@/components/ui/enhanced-profile-card';
import { EmailSignatureTemplate } from '@/components/email-signature/template';

export default function ProfilePreviewPage() {
  const [activeTab, setActiveTab] = useState<'card' | 'signature'>('card');

  const profileData = {
    name: 'Sarah Anderson',
    title: 'Senior Product Designer',
    company: 'TechCorp Inc.',
    bio: 'Passionate about creating intuitive and beautiful user experiences. Specializing in design systems and web animation.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    companyLogo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop',
    email: 'sarah.anderson@techcorp.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'https://techcorp.com',
    linkedin: 'https://linkedin.com/in/sarahanderson',
    twitter: 'https://twitter.com/sarahanderson',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://lynq.com/sarah',
    primaryColor: '#3b82f6',
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">LynQ</h1>
              <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                ← Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Profile Assets</h2>
          <p className="text-muted-foreground">Preview and download your profile card and email signature</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('card')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'card'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Digital Business Card
          </button>
          <button
            onClick={() => setActiveTab('signature')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'signature'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Email Signature
          </button>
        </div>

        {/* Content */}
        <div className="bg-card rounded-xl border border-border p-8">
          {activeTab === 'card' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Digital Business Card
                </h3>
                <p className="text-muted-foreground">
                  This is how your profile appears to visitors
                </p>
              </div>
              <EnhancedProfileCard {...profileData} />
              <div className="text-center mt-8">
                <p className="text-sm text-muted-foreground mb-4">
                  Notice the company logo appears as a small badge on your profile picture
                </p>
              </div>
            </div>
          )}

          {activeTab === 'signature' && (
            <div>
              <EmailSignatureTemplate {...profileData} />
            </div>
          )}
        </div>

        {/* Feature Highlight */}
        <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">✨</div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Company Logo Badge Feature
              </h3>
              <p className="text-sm text-muted-foreground">
                Your company logo now appears as a small circular badge beside your profile picture in both
                your digital business card and email signature. This helps reinforce your company branding
                and makes your profile more professional and recognizable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
