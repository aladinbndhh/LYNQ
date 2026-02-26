import { Types } from 'mongoose';
import { Lead } from '@/lib/db/models';
import { ILead } from '@/types';
import { TenantContext } from '@/lib/middleware/tenant';

export class LeadService {
  /**
   * Create a new lead
   */
  static async createLead(
    data: Partial<ILead>,
    tenantContext: TenantContext
  ): Promise<ILead> {
    return Lead.create({
      ...data,
      tenantId: tenantContext.tenantId,
    });
  }

  /**
   * Get lead by ID
   */
  static async getLeadById(
    leadId: string,
    tenantContext: TenantContext
  ): Promise<ILead | null> {
    return Lead.findOne({
      _id: leadId,
      tenantId: tenantContext.tenantId,
    });
  }

  /**
   * List all leads for tenant
   */
  static async listLeads(
    tenantContext: TenantContext,
    filters?: {
      profileId?: string;
      status?: string;
      source?: string;
    }
  ): Promise<ILead[]> {
    const query: any = { tenantId: tenantContext.tenantId };

    if (filters?.profileId) query.profileId = filters.profileId;
    if (filters?.status) query.status = filters.status;
    if (filters?.source) query.source = filters.source;

    return Lead.find(query).sort({ createdAt: -1 });
  }

  /**
   * Update lead
   */
  static async updateLead(
    leadId: string,
    data: Partial<ILead>,
    tenantContext: TenantContext
  ): Promise<ILead | null> {
    return Lead.findOneAndUpdate(
      {
        _id: leadId,
        tenantId: tenantContext.tenantId,
      },
      { $set: data },
      { new: true }
    );
  }

  /**
   * Delete lead
   */
  static async deleteLead(
    leadId: string,
    tenantContext: TenantContext
  ): Promise<boolean> {
    const result = await Lead.deleteOne({
      _id: leadId,
      tenantId: tenantContext.tenantId,
    });
    return result.deletedCount > 0;
  }

  /**
   * Get lead statistics
   */
  static async getLeadStats(tenantContext: TenantContext): Promise<any> {
    const [total, byStatus, bySource] = await Promise.all([
      Lead.countDocuments({ tenantId: tenantContext.tenantId }),

      Lead.aggregate([
        { $match: { tenantId: tenantContext.tenantId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Lead.aggregate([
        { $match: { tenantId: tenantContext.tenantId } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      bySource: bySource.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
