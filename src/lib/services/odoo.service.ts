import { Types } from 'mongoose';
import { Tenant, Lead } from '@/lib/db/models';
import { OdooClient } from '@/lib/integrations/odoo-client';
import { TenantContext } from '@/lib/middleware/tenant';
import { ILead } from '@/types';

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
