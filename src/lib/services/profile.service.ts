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
