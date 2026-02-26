'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ILead } from '@/types';
import { ModernLeadsTable } from '@/components/leads/modern-leads-table';

export default function LeadsListPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<ILead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();

      if (data.success) {
        setLeads(data.data);
      } else {
        setError(data.error || 'Failed to fetch leads');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLead = (id: string) => {
    // Just view, no edit/delete - leads are managed in Odoo
    console.log('View lead:', id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
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
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Leads</h2>
          <p className="text-muted-foreground mt-2">View your captured leads from Odoo</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
            {error}
          </div>
        )}

        <ModernLeadsTable
          leads={leads}
          onViewLead={handleViewLead}
          onEditLead={undefined}
          onDeleteLead={undefined}
        />
      </div>
    </div>
  );
}
