'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IProfile } from '@/types';

export default function ProfilesListPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<IProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/profiles');
      const data = await response.json();

      if (data.success) {
        setProfiles(data.data);
      } else {
        setError(data.error || 'Failed to fetch profiles');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Your Business Cards</h2>
          <p className="text-gray-600 mt-2">View your digital business cards with QR codes</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {profiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No business cards yet</h3>
            <p className="text-gray-600">
              Business cards are created in Odoo. Once created, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => {
              // Get Odoo URL for contact page link
              // Extract base URL from QR code image URL if available, otherwise use default
              let odooBaseUrl = 'https://aladinbndhh-lynq-test-live-29061122.dev.odoo.com';
              if (profile.qrCode && profile.qrCode.includes('/web/image')) {
                // Extract base URL from QR code image URL
                odooBaseUrl = profile.qrCode.split('/web/image')[0];
              }
              const contactUrl = `${odooBaseUrl}/lynq/contact/${profile.username}`;
              
              return (
                <div key={String(profile.id || profile._id)} className="bg-white rounded-lg shadow-lg p-6 border-2" style={{ borderColor: profile.branding?.primaryColor || '#3b82f6' }}>
                  {/* Business Card Header */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {profile.avatar ? (
                        <img 
                          src={profile.avatar} 
                          alt={profile.displayName}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                          style={{ backgroundColor: profile.branding?.primaryColor || '#3b82f6' }}
                        >
                          {profile.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {profile.company && (
                        <div className="w-12 h-12 rounded-full bg-white border-2 border-white p-0.5 shadow-md flex-shrink-0">
                          {profile.branding?.logo && profile.branding.logo !== 'undefined' && profile.branding.logo !== '' ? (
                            <img 
                              src={profile.branding.logo} 
                              alt={profile.company || ''}
                              className="w-full h-full rounded-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-semibold';
                                  placeholder.textContent = profile.company.charAt(0).toUpperCase();
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-semibold">
                              {profile.company.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{profile.displayName}</h3>
                    {profile.title && <p className="text-gray-600 mt-1">{profile.title}</p>}
                    {profile.company && <p className="text-gray-500 text-sm mt-1">{profile.company}</p>}
                  </div>

                  {/* Contact Info */}
                  {profile.contactInfo && (
                    <div className="mb-6 space-y-2 text-sm">
                      {profile.contactInfo.email && (
                        <div className="text-gray-600">📧 {profile.contactInfo.email}</div>
                      )}
                      {profile.contactInfo.phone && (
                        <div className="text-gray-600">📱 {profile.contactInfo.phone}</div>
                      )}
                    </div>
                  )}

                  {/* QR Code */}
                  <div className="text-center mb-6">
                    {profile.qrCode ? (
                      <div>
                        <img 
                          src={profile.qrCode} 
                          alt="QR Code"
                          className="w-32 h-32 mx-auto border-2 border-gray-200 rounded"
                        />
                        <p className="text-xs text-gray-500 mt-2">Scan to save contact</p>
                        <p className="text-xs text-gray-400 mt-1 break-all">{contactUrl}</p>
                      </div>
                    ) : (
                      <div className="w-32 h-32 mx-auto bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        No QR Code
                      </div>
                    )}
                  </div>

                  {/* View Contact Page Link */}
                  <div className="text-center">
                    <a
                      href={contactUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      View Contact Page
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
