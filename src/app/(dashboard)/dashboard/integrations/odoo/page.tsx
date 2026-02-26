'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Loader2, Database, Link2, RefreshCw } from 'lucide-react';

export default function OdooConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    url?: string;
    database?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    database: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [syncResult, setSyncResult] = useState<any>(null);

  useEffect(() => {
    fetchConnectionStatus();
  }, []);

  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch('/api/odoo/status');
      const data = await response.json();
      if (data.success) {
        setConnectionStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch connection status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConnecting(true);

    try {
      const response = await fetch('/api/odoo/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setConnectionStatus({ connected: true, url: formData.url, database: formData.database });
        setFormData({ url: '', database: '', username: '', password: '' });
      } else {
        setError(data.error || 'Failed to connect to Odoo');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect from Odoo?')) {
      return;
    }

    try {
      const response = await fetch('/api/odoo/disconnect', {
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

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/odoo/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSyncResult(data.data);
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err: any) {
      setError(err.message || 'Sync failed');
    } finally {
      setSyncing(false);
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
          <h2 className="text-3xl font-bold text-foreground">Odoo Integration</h2>
          <p className="text-muted-foreground mt-2">
            Connect your Odoo instance for CRM and calendar synchronization
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connection Status</CardTitle>
                <CardDescription>Current Odoo integration status</CardDescription>
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
          {connectionStatus?.connected && (
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Database:</span>
                  <span className="font-medium">{connectionStatus.database}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">URL:</span>
                  <span className="font-medium">{connectionStatus.url}</span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSync} disabled={syncing}>
                  {syncing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {syncing ? 'Syncing...' : 'Sync Leads Now'}
                </Button>
                <Button variant="outline" className="text-destructive" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Sync Results */}
        {syncResult && (
          <Card className="mb-6 border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-green-800">Sync Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>✅ Successfully synced: <strong>{syncResult.success}</strong> leads</div>
                {syncResult.failed > 0 && (
                  <div className="text-red-600">❌ Failed: <strong>{syncResult.failed}</strong> leads</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connection Form */}
        {!connectionStatus?.connected && (
          <Card>
            <CardHeader>
              <CardTitle>Connect to Odoo</CardTitle>
              <CardDescription>
                Enter your Odoo instance credentials to enable CRM integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Odoo URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://your-odoo-instance.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Odoo server URL (e.g., https://mycompany.odoo.com)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="database">Database Name</Label>
                  <Input
                    id="database"
                    type="text"
                    placeholder="mycompany"
                    value={formData.database}
                    onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Odoo database name
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <Separator className="my-6" />

                <Button type="submit" className="w-full" disabled={connecting}>
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Connect to Odoo
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Features Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>What Gets Synced</CardTitle>
            <CardDescription>LynQ automatically syncs the following data with Odoo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Contacts
                </h4>
                <p className="text-sm text-muted-foreground">
                  Leads from LynQ are automatically created as contacts in Odoo
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  CRM Opportunities
                </h4>
                <p className="text-sm text-muted-foreground">
                  Qualified leads become opportunities with "LynQ" as source
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Calendar Events
                </h4>
                <p className="text-sm text-muted-foreground">
                  Meetings booked through LynQ appear in your Odoo calendar
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Activity Logs
                </h4>
                <p className="text-sm text-muted-foreground">
                  AI conversation summaries are logged as activities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="mt-6 bg-muted/50">
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">1.</span>
                <span>Install the LynQ Connector module in your Odoo instance (see <code className="px-1 py-0.5 bg-muted rounded text-xs">odoo-module/</code> folder)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">2.</span>
                <span>Enter your Odoo URL, database name, and admin credentials above</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">3.</span>
                <span>Click "Connect to Odoo" to establish the connection</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">4.</span>
                <span>Use "Sync Leads Now" to manually sync existing leads, or they'll sync automatically</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
