import { OdooClient } from '@/lib/integrations/odoo-client';
import { Tenant } from '@/lib/db/models';

export interface OdooLead {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  source?: string;
  notes?: string;
  createdAt?: string;
}

export class OdooLeadService {
  /**
   * Get Odoo client using user credentials
   */
  private static async getOdooClient(email: string, password: string): Promise<OdooClient> {
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';
    const odooDb = process.env.ODOO_DATABASE || 'odoo';

    return new OdooClient({
      url: odooUrl,
      database: odooDb,
      username: email,
      password: password,
    });
  }

  /**
   * List all leads from Odoo (CRM opportunities)
   */
  static async listLeads(
    email: string,
    password: string,
    filters?: {
      profileId?: number;
      status?: string;
      source?: string;
    }
  ): Promise<OdooLead[]> {
    const client = await this.getOdooClient(email, password);
    
    const domain: any[] = [['lynq_source', '!=', false]]; // Only LynQ leads
    
    if (filters?.profileId) {
      domain.push(['lynq_profile_id', '=', String(filters.profileId)]);
    }
    if (filters?.status) {
      domain.push(['stage_id.name', '=', filters.status]);
    }
    if (filters?.source) {
      domain.push(['lynq_source', '=', filters.source]);
    }

    const leads = await client.searchRead(
      'crm.lead',
      domain,
      [
        'id',
        'name',
        'email_from',
        'phone',
        'partner_id',
        'stage_id',
        'lynq_source',
        'description',
        'create_date',
      ]
    );

    return leads.map((lead: any) => ({
      id: lead.id,
      name: lead.name,
      email: lead.email_from,
      phone: lead.phone,
      company: lead.partner_id?.[1] || undefined, // Partner name
      status: lead.stage_id?.[1] || 'new',
      source: lead.lynq_source || 'qr',
      notes: lead.description || undefined,
      createdAt: lead.create_date,
    }));
  }

  /**
   * Get lead statistics from Odoo
   */
  static async getLeadStats(email: string, password: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
  }> {
    const client = await this.getOdooClient(email, password);
    
    const allLeads = await client.searchRead(
      'crm.lead',
      [['lynq_source', '!=', false]], // Only LynQ leads
      ['id', 'stage_id', 'lynq_source']
    );

    const stats = {
      total: allLeads.length,
      byStatus: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
    };

    allLeads.forEach((lead: any) => {
      const status = lead.stage_id?.[1] || 'new';
      const source = lead.lynq_source || 'unknown';
      
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
    });

    return stats;
  }
}
