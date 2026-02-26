'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Loader2, Calendar, Link2, RefreshCw, AlertCircle } from 'lucide-react';

function GoogleCalendarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    email?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchConnectionStatus();

    // Handle OAuth callback
    const code = searchParams.get('code');
    if (code) {
      handleOAuthCallback(code);
    }
  }, [searchParams]);

  const fetchConnectionStatus = async () => {
    try {
      // For now, check if tenant has Google calendar integration
      // In production, this would call /api/calendar/google/status
      setConnectionStatus({ connected: false });
    } catch (error) {
      console.error('Failed to fetch connection status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Redirect to Google OAuth
      const response = await fetch('/api/calendar/google/auth');
      const data = await response.json();
      
      if (data.success && data.data.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        alert('Failed to initiate Google Calendar connection');
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect to Google Calendar');
    } finally {
      setConnecting(false);
    }
  };

  const handleOAuthCallback = async (code: string) => {
    try {
      const response = await fetch('/api/calendar/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.success) {
        setConnectionStatus({ connected: true, email: data.data.email });
        // Remove code from URL
        router.replace('/dashboard/integrations/google-calendar');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar?')) {
      return;
    }

    try {
      const response = await fetch('/api/calendar/google/disconnect', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setConnectionStatus({ connected: false });
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">
                LynQ
              </Link>
              <Link href="/dashboard/settings" className="text-muted-foreground hover:text-foreground">
                ← Back to Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Google Calendar Integration</h2>
          <p className="text-muted-foreground mt-2">
            Connect your Google Calendar for smart scheduling and availability checking
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connection Status</CardTitle>
                <CardDescription>Current Google Calendar integration status</CardDescription>
              </div>
              {connectionStatus?.connected ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {connectionStatus?.connected ? (
              <>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Account:</span>
                    <span className="font-medium">{connectionStatus.email || 'Connected'}</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <Button variant="outline" className="text-destructive" onClick={handleDisconnect}>
                  Disconnect Google Calendar
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Setup Required</p>
                      <p>
                        To connect Google Calendar, you need to configure OAuth credentials in Google Cloud Console.
                        Update <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">GOOGLE_CLIENT_ID</code> and{' '}
                        <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">GOOGLE_CLIENT_SECRET</code> in your <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">.env</code> file.
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleConnect} className="w-full" disabled={connecting}>
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Connect Google Calendar
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Info */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>What you get with Google Calendar integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Smart Availability</h4>
                  <p className="text-sm text-muted-foreground">
                    LynQ automatically checks your Google Calendar to find available time slots
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Automatic Booking</h4>
                  <p className="text-sm text-muted-foreground">
                    Meetings booked through LynQ are automatically added to your Google Calendar
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Calendar Invites</h4>
                  <p className="text-sm text-muted-foreground">
                    Attendees receive proper Google Calendar invites with all meeting details
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Conflict Prevention</h4>
                  <p className="text-sm text-muted-foreground">
                    Never double-book - LynQ respects your existing calendar events
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="mt-6 bg-muted/50">
          <CardHeader>
            <CardTitle>Google Cloud Console Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">1.</span>
                <span>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">2.</span>
                <span>Create a new project or select existing project</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">3.</span>
                <span>Enable Google Calendar API</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">4.</span>
                <span>Create OAuth 2.0 credentials (Web application)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">5.</span>
                <span>Add redirect URI: <code className="px-1 py-0.5 bg-muted rounded text-xs">http://localhost:3000/api/calendar/google/callback</code></span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">6.</span>
                <span>Copy Client ID and Client Secret to your <code className="px-1 py-0.5 bg-muted rounded text-xs">.env</code> file</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function GoogleCalendarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <GoogleCalendarContent />
    </Suspense>
  );
}
