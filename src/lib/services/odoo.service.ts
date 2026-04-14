import { Types } from 'mongoose';
import { Tenant, Lead } from '@/lib/db/models';
import { OdooClient } from '@/lib/integrations/odoo-client';
import { TenantContext } from '@/lib/middleware/tenant';
import { ILead } from '@/types';

export interface OdooEmployee {
  id: number;
  name: string;
  email: string;
  title?: string;
  department?: string;
  company?: string;
  companyId?: number;
  avatar?: string;
  logo?: string;
  phone?: string;
}

export class OdooService {
  /**
   * Connect to Odoo
   */
  static async connectOdoo(
    tenantContext: TenantContext,
    config: {
      url: string;
      database: string;
      username: string;
      password: string;
    }
  ): Promise<boolean> {
    try {
      // Test connection
      const client = new OdooClient(config);
      await client.authenticate();

      // Save config
      await Tenant.findByIdAndUpdate(tenantContext.tenantId, {
        $set: {
          odooConfig: {
            url: config.url,
            database: config.database,
            accessToken: config.password, // In production, use OAuth tokens
            refreshToken: '',
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          },
        },
      });

      return true;
    } catch (error) {
      console.error('Odoo connection error:', error);
      throw new Error('Failed to connect to Odoo');
    }
  }

  /**
   * Get employees directly from hr.employee in Odoo — no lynq.profile record needed
   */
  static async getOdooEmployees(tenantId: Types.ObjectId): Promise<OdooEmployee[]> {
    const tenant = await Tenant.findById(tenantId).lean();
    if (!tenant?.odooConfig?.url) {
      throw new Error('Odoo not connected');
    }

    const baseUrl = tenant.odooConfig.url.replace(/\/$/, '');
    const client = new OdooClient({
      url: baseUrl,
      database: tenant.odooConfig.database || '',
      username: '',
      password: '',
    });

    const employees = await client.searchRead(
      'hr.employee',
      [['active', '=', true]],
      [
        'id',
        'name',
        'work_email',
        'job_title',
        'job_id',
        'department_id',
        'company_id',
        'work_phone',
        'mobile_phone',
      ]
    );

    return employees.map((e: any) => {
      const companyId = e.company_id
        ? (Array.isArray(e.company_id) ? e.company_id[0] : e.company_id)
        : null;
      const companyName = e.company_id
        ? (Array.isArray(e.company_id) ? e.company_id[1] : undefined)
        : undefined;
      const deptName = e.department_id
        ? (Array.isArray(e.department_id) ? e.department_id[1] : undefined)
        : undefined;

      return {
        id: e.id,
        name: e.name || '',
        email: e.work_email || '',
        title: e.job_title || (e.job_id ? (Array.isArray(e.job_id) ? e.job_id[1] : undefined) : undefined),
        department: deptName,
        company: companyName,
        companyId: companyId || undefined,
        avatar: `${baseUrl}/lynq/image/employee/${e.id}/avatar`,
        logo: companyId ? `${baseUrl}/lynq/image/company/${companyId}/logo` : undefined,
        phone: e.work_phone || e.mobile_phone || undefined,
      } as OdooEmployee;
    });
  }

  /**
   * Get a single hr.employee record for pre-filling an accepted invitation
   */
  static async getOdooProfileForInvite(
    tenantId: Types.ObjectId,
    odooEmployeeId: number
  ): Promise<OdooEmployee | null> {
    const tenant = await Tenant.findById(tenantId).lean();
    if (!tenant?.odooConfig?.url) return null;

    const baseUrl = tenant.odooConfig.url.replace(/\/$/, '');
    const client = new OdooClient({
      url: baseUrl,
      database: tenant.odooConfig.database || '',
      username: '',
      password: '',
    });

    const employees = await client.searchRead(
      'hr.employee',
      [['id', '=', odooEmployeeId]],
      [
        'id',
        'name',
        'work_email',
        'job_title',
        'job_id',
        'department_id',
        'company_id',
        'work_phone',
        'mobile_phone',
      ],
      1
    );

    if (employees.length === 0) return null;

    const e = employees[0];
    const companyId = e.company_id
      ? (Array.isArray(e.company_id) ? e.company_id[0] : e.company_id)
      : null;
    const companyName = e.company_id
      ? (Array.isArray(e.company_id) ? e.company_id[1] : undefined)
      : undefined;

    return {
      id: e.id,
      name: e.name || '',
      email: e.work_email || '',
      title: e.job_title || (e.job_id ? (Array.isArray(e.job_id) ? e.job_id[1] : undefined) : undefined),
      department: e.department_id
        ? (Array.isArray(e.department_id) ? e.department_id[1] : undefined)
        : undefined,
      company: companyName,
      companyId: companyId || undefined,
      avatar: `${baseUrl}/lynq/image/employee/${e.id}/avatar`,
      logo: companyId ? `${baseUrl}/lynq/image/company/${companyId}/logo` : undefined,
      phone: e.work_phone || e.mobile_phone || undefined,
    } as OdooEmployee;
  }

  /**
   * Disconnect from Odoo
   */
  static async disconnectOdoo(tenantContext: TenantContext): Promise<boolean> {
    await Tenant.findByIdAndUpdate(tenantContext.tenantId, {
      $unset: { odooConfig: '' },
    });

    return true;
  }

  /**
   * Get Odoo connection status
   */
  static async getConnectionStatus(tenantContext: TenantContext): Promise<{
    connected: boolean;
    url?: string;
    database?: string;
  }> {
    const tenant = await Tenant.findById(tenantContext.tenantId);

    if (!tenant?.odooConfig) {
      return { connected: false };
    }

    return {
      connected: true,
      url: tenant.odooConfig.url,
      database: tenant.odooConfig.database,
    };
  }

  /**
   * Sync lead to Odoo
   */
  static async syncLeadToOdoo(
    leadId: string,
    tenantContext: TenantContext
  ): Promise<ILead> {
    const tenant = await Tenant.findById(tenantContext.tenantId);
    if (!tenant?.odooConfig) {
      throw new Error('Odoo not connected');
    }

    const lead = await Lead.findOne({
      _id: leadId,
      tenantId: tenantContext.tenantId,
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    try {
      const client = new OdooClient({
        url: tenant.odooConfig.url,
        database: tenant.odooConfig.database,
        username: '', // Would come from OAuth
        password: tenant.odooConfig.accessToken,
      });

      // Create or update contact
      let odooContactId = lead.odooSyncStatus?.odooContactId;

      if (!odooContactId && lead.email) {
        odooContactId = await client.createContact({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company_name: lead.company,
        });
      }

      // Create or update lead/opportunity
      let odooLeadId = lead.odooSyncStatus?.odooLeadId;

      if (!odooLeadId) {
        // Get or create LynQ source
        const lynqSource = await this.getOrCreateLynQSource(client);

        odooLeadId = await client.createLead({
          name: lead.intent || `Lead from ${lead.name}`,
          contact_name: lead.name,
          email_from: lead.email,
          phone: lead.phone,
          description: lead.notes,
          source_id: lynqSource,
        });
      }

      // Update lead with Odoo sync status
      lead.odooSyncStatus = {
        synced: true,
        odooContactId,
        odooLeadId,
        lastSyncAt: new Date(),
      };

      await lead.save();

      return lead;
    } catch (error: any) {
      // Update lead with error
      lead.odooSyncStatus = {
        ...(lead.odooSyncStatus || {}),
        synced: false,
        error: error.message,
        lastSyncAt: new Date(),
      };

      await lead.save();

      throw error;
    }
  }

  /**
   * Sync all leads to Odoo
   */
  static async syncAllLeadsToOdoo(tenantContext: TenantContext): Promise<{
    success: number;
    failed: number;
    errors: Array<{ leadId: string; error: string }>;
  }> {
    const leads = await Lead.find({
      tenantId: tenantContext.tenantId,
      'odooSyncStatus.synced': { $ne: true },
    });

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ leadId: string; error: string }>,
    };

    for (const lead of leads) {
      try {
        await this.syncLeadToOdoo(lead._id.toString(), tenantContext);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          leadId: lead._id.toString(),
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Get or create LynQ source in Odoo
   */
  private static async getOrCreateLynQSource(client: OdooClient): Promise<number> {
    try {
      // Search for existing LynQ source
      const sources = await client.searchRead(
        'utm.source',
        [['name', '=', 'LynQ']],
        ['id'],
        1
      );

      if (sources.length > 0) {
        return sources[0].id;
      }

      // Create new source
      return await client.create('utm.source', { name: 'LynQ' });
    } catch (error) {
      console.error('Error creating LynQ source:', error);
      throw error;
    }
  }
}
