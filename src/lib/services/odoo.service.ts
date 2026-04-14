import { Types } from 'mongoose';
import { Tenant, Lead } from '@/lib/db/models';
import { OdooClient } from '@/lib/integrations/odoo-client';
import { TenantContext } from '@/lib/middleware/tenant';
import { ILead } from '@/types';

export interface OdooEmployee {
  id: number;
  name: string;
  email: string;
  username: string;
  title?: string;
  company?: string;
  avatar?: string;
  coverImage?: string;
  logo?: string;
  primaryColor: string;
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
   * Get employees (lynq.profile records) from the tenant's connected Odoo instance
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

    const profiles = await client.searchRead(
      'lynq.profile',
      [],
      [
        'id',
        'display_name',
        'email',
        'username',
        'title',
        'company',
        'avatar',
        'partner_id',
        'cover_image',
        'primary_color',
        'company_logo',
      ]
    );

    return profiles.map((p: any) => {
      const partnerId = p.partner_id
        ? (Array.isArray(p.partner_id) ? p.partner_id[0] : p.partner_id)
        : null;

      const avatar = partnerId
        ? `${baseUrl}/lynq/image/partner/${partnerId}/avatar`
        : p.avatar
          ? `${baseUrl}/web/image/lynq.profile/${p.id}/avatar`
          : undefined;

      return {
        id: p.id,
        name: p.display_name || '',
        email: p.email || '',
        username: p.username || '',
        title: p.title || undefined,
        company: p.company || undefined,
        avatar,
        coverImage: p.cover_image
          ? `${baseUrl}/web/image/lynq.profile/${p.id}/cover_image`
          : undefined,
        logo: p.company
          ? `${baseUrl}/lynq/image/profile/${p.id}/company_logo`
          : undefined,
        primaryColor: p.primary_color || '#3b82f6',
      } as OdooEmployee;
    });
  }

  /**
   * Get a single Odoo profile record for pre-filling an accepted invitation
   */
  static async getOdooProfileForInvite(
    tenantId: Types.ObjectId,
    odooProfileId: number
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

    const profiles = await client.searchRead(
      'lynq.profile',
      [['id', '=', odooProfileId]],
      [
        'id',
        'display_name',
        'email',
        'username',
        'title',
        'company',
        'bio',
        'avatar',
        'partner_id',
        'cover_image',
        'primary_color',
        'company_logo',
        'phone',
        'linkedin',
        'twitter',
      ],
      1
    );

    if (profiles.length === 0) return null;

    const p = profiles[0];
    const partnerId = p.partner_id
      ? (Array.isArray(p.partner_id) ? p.partner_id[0] : p.partner_id)
      : null;

    const avatar = partnerId
      ? `${baseUrl}/lynq/image/partner/${partnerId}/avatar`
      : p.avatar
        ? `${baseUrl}/web/image/lynq.profile/${p.id}/avatar`
        : undefined;

    return {
      id: p.id,
      name: p.display_name || '',
      email: p.email || '',
      username: p.username || '',
      title: p.title || undefined,
      company: p.company || undefined,
      avatar,
      coverImage: p.cover_image
        ? `${baseUrl}/web/image/lynq.profile/${p.id}/cover_image`
        : undefined,
      logo: p.company
        ? `${baseUrl}/lynq/image/profile/${p.id}/company_logo`
        : undefined,
      primaryColor: p.primary_color || '#3b82f6',
      // Extra fields for profile creation
      ...(p.bio ? { bio: p.bio } : {}),
      ...(p.phone ? { phone: p.phone } : {}),
      ...(p.linkedin ? { linkedin: p.linkedin } : {}),
      ...(p.twitter ? { twitter: p.twitter } : {}),
    } as OdooEmployee & { bio?: string; phone?: string; linkedin?: string; twitter?: string };
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
