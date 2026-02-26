import QRCode from 'qrcode';
import { Types } from 'mongoose';
import { Profile, Tenant } from '@/lib/db/models';
import { IProfile } from '@/types';
import { TenantContext } from '@/lib/middleware/tenant';

export class ProfileService {
  /**
   * Create a new profile
   */
  static async createProfile(
    data: Partial<IProfile>,
    tenantContext: TenantContext
  ): Promise<IProfile> {
    // Check if username is already taken
    const existing = await Profile.findOne({ username: data.username });
    if (existing) {
      throw new Error('Username already taken');
    }

    // Get tenant's Odoo URL for QR code
    const tenant = await Tenant.findById(tenantContext.tenantId);
    const odooUrl = tenant?.odooConfig?.url || process.env.ODOO_URL || 'http://localhost:8069';
    
    // Generate QR code - link to Odoo contact page for lead capture
    const contactUrl = `${odooUrl}/lynq/contact/${data.username}`;
    const qrCode = await this.generateQRCode(contactUrl);

    const profile = await Profile.create({
      ...data,
      tenantId: tenantContext.tenantId,
      qrCode,
    });

    return profile;
  }

  /**
   * Get profile by ID
   */
  static async getProfileById(
    profileId: string,
    tenantContext: TenantContext
  ): Promise<IProfile | null> {
    return Profile.findOne({
      _id: profileId,
      tenantId: tenantContext.tenantId,
    });
  }

  /**
   * Get profile by username (public)
   */
  static async getProfileByUsername(username: string): Promise<IProfile | null> {
    return Profile.findOne({ username, isPublic: true });
  }

  /**
   * List all profiles for tenant
   */
  static async listProfiles(tenantContext: TenantContext): Promise<IProfile[]> {
    return Profile.find({ tenantId: tenantContext.tenantId }).sort({ createdAt: -1 });
  }

  /**
   * Update profile
   */
  static async updateProfile(
    profileId: string,
    data: Partial<IProfile>,
    tenantContext: TenantContext
  ): Promise<IProfile | null> {
    // If username is being changed, check if it's available
    if (data.username) {
      const existing = await Profile.findOne({
        username: data.username,
        _id: { $ne: profileId },
      });
      if (existing) {
        throw new Error('Username already taken');
      }

      // Get tenant's Odoo URL for QR code
      const tenant = await Tenant.findById(tenantContext.tenantId);
      const odooUrl = tenant?.odooConfig?.url || process.env.ODOO_URL || 'http://localhost:8069';
      
      // Regenerate QR code with new username - link to Odoo contact page
      const contactUrl = `${odooUrl}/lynq/contact/${data.username}`;
      data.qrCode = await this.generateQRCode(contactUrl);
    }

    return Profile.findOneAndUpdate(
      {
        _id: profileId,
        tenantId: tenantContext.tenantId,
      },
      { $set: data },
      { new: true }
    );
  }

  /**
   * Delete profile
   */
  static async deleteProfile(
    profileId: string,
    tenantContext: TenantContext
  ): Promise<boolean> {
    const result = await Profile.deleteOne({
      _id: profileId,
      tenantId: tenantContext.tenantId,
    });
    return result.deletedCount > 0;
  }

  /**
   * Generate QR code as data URL
   */
  static async generateQRCode(url: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('QR code generation error:', error);
      return '';
    }
  }

  /**
   * Check if username is available
   */
  static async isUsernameAvailable(username: string): Promise<boolean> {
    const existing = await Profile.findOne({ username });
    return !existing;
  }
}
