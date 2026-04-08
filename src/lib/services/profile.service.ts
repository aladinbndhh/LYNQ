import QRCode from 'qrcode';
import { Profile } from '@/lib/db/models';
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
    const existing = await Profile.findOne({ username: data.username });
    if (existing) {
      throw new Error('Username already taken');
    }

    const qrCode = await this.generateQRCode(data.username!);

    const profile = await Profile.create({
      ...data,
      tenantId: tenantContext.tenantId,
      userId: tenantContext.user.id,
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
   * List profiles for tenant.
   * Admins see every card in the org; members only see their own.
   */
  static async listProfiles(tenantContext: TenantContext): Promise<IProfile[]> {
    const filter: Record<string, unknown> = { tenantId: tenantContext.tenantId };

    if (!tenantContext.isAdmin()) {
      filter.userId = tenantContext.user.id;
    }

    return Profile.find(filter).sort({ createdAt: -1 });
  }

  /**
   * Update profile.
   * Members may only update their own cards; admins may update any card in the tenant.
   */
  static async updateProfile(
    profileId: string,
    data: Partial<IProfile>,
    tenantContext: TenantContext
  ): Promise<IProfile | null> {
    if (data.username) {
      const existing = await Profile.findOne({
        username: data.username,
        _id: { $ne: profileId },
      });
      if (existing) {
        throw new Error('Username already taken');
      }
      data.qrCode = await this.generateQRCode(data.username);
    }

    const ownershipFilter = tenantContext.isAdmin()
      ? { _id: profileId, tenantId: tenantContext.tenantId }
      : { _id: profileId, tenantId: tenantContext.tenantId, userId: tenantContext.user.id };

    return Profile.findOneAndUpdate(ownershipFilter, { $set: data }, { new: true });
  }

  /**
   * Delete profile.
   * Members may only delete their own cards; admins may delete any card in the tenant.
   */
  static async deleteProfile(
    profileId: string,
    tenantContext: TenantContext
  ): Promise<boolean> {
    const ownershipFilter = tenantContext.isAdmin()
      ? { _id: profileId, tenantId: tenantContext.tenantId }
      : { _id: profileId, tenantId: tenantContext.tenantId, userId: tenantContext.user.id };

    const result = await Profile.deleteOne(ownershipFilter);
    return result.deletedCount > 0;
  }

  /**
   * Generate QR code pointing to the Next.js public card page
   */
  static async generateQRCode(username: string): Promise<string> {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const contactUrl = `${appUrl}/${username}`;
      const qrCodeDataUrl = await QRCode.toDataURL(contactUrl, {
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
