import { OdooClient } from '@/lib/integrations/odoo-client';

export interface OdooProfile {
  id: number;
  username: string;
  displayName: string;
  title?: string;
  company?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  branding?: {
    primaryColor?: string;
    logo?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    linkedin?: string;
    twitter?: string;
  };
  qrCode?: string;
  isPublic?: boolean;
  aiConfig?: {
    enabled: boolean;
    personality?: string;
    greeting?: string;
    qualificationQuestions?: string[];
    autoBooking?: boolean;
  };
}

export class OdooProfileService {
  /**
   * Get Odoo client using environment config (hardcoded for now)
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
   * List all profiles for current user from Odoo
   */
  static async listProfiles(email: string, password: string, userId: number): Promise<OdooProfile[]> {
    const client = await this.getOdooClient(email, password);
    
    // Search for profiles belonging to this user
    const profiles = await client.searchRead(
      'lynq.profile',
      [['user_id', '=', userId]],
      [
        'id',
        'username',
        'display_name',
        'title',
        'company',
        'bio',
        'avatar',
        'cover_image',
        'company_logo',
        'primary_color',
        'email',
        'phone',
        'linkedin',
        'twitter',
        'qr_code',
        'is_public',
        'ai_enabled',
        'ai_personality',
        'ai_greeting',
        'ai_qualification_questions',
        'ai_auto_booking',
        'partner_id', // Get partner ID for avatar
      ]
    );

    return profiles.map((p: any) => this.mapOdooToProfile(p));
  }

  /**
   * Get profile by ID from Odoo
   */
  static async getProfileById(email: string, password: string, profileId: number): Promise<OdooProfile | null> {
    const client = await this.getOdooClient(email, password);
    
    const profiles = await client.searchRead(
      'lynq.profile',
      [['id', '=', profileId]],
      [
        'id',
        'username',
        'display_name',
        'title',
        'company',
        'bio',
        'avatar',
        'cover_image',
        'company_logo',
        'primary_color',
        'email',
        'phone',
        'linkedin',
        'twitter',
        'qr_code',
        'is_public',
        'ai_enabled',
        'ai_personality',
        'ai_greeting',
        'ai_qualification_questions',
        'ai_auto_booking',
        'partner_id', // Get partner ID for avatar
      ],
      1
    );

    if (profiles.length === 0) return null;
    return this.mapOdooToProfile(profiles[0]);
  }

  /**
   * Get profile by username from Odoo (public - no auth needed)
   */
  static async getProfileByUsername(username: string): Promise<OdooProfile | null> {
    // Use a system user or public access for reading public profiles
    const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';
    const odooDb = process.env.ODOO_DATABASE || 'odoo';
    const systemUser = process.env.ODOO_SYSTEM_USER || 'admin';
    const systemPassword = process.env.ODOO_SYSTEM_PASSWORD || 'admin';
    
    const client = new OdooClient({
      url: odooUrl,
      database: odooDb,
      username: systemUser,
      password: systemPassword,
    });
    
    const profiles = await client.searchRead(
      'lynq.profile',
      [['username', '=', username], ['is_public', '=', true]],
      [
        'id',
        'username',
        'display_name',
        'title',
        'company',
        'bio',
        'avatar',
        'cover_image',
        'company_logo',
        'primary_color',
        'email',
        'phone',
        'linkedin',
        'twitter',
        'qr_code',
        'is_public',
        'ai_enabled',
        'ai_personality',
        'ai_greeting',
        'ai_qualification_questions',
        'ai_auto_booking',
        'partner_id', // Get partner ID for avatar
      ],
      1
    );

    if (profiles.length === 0) return null;
    return this.mapOdooToProfile(profiles[0]);
  }

  /**
   * Map Odoo profile data to LynQ format
   */
  private static mapOdooToProfile(odooProfile: any): OdooProfile {
    const baseUrl = process.env.ODOO_URL || process.env.NEXT_PUBLIC_ODOO_URL || 'https://aladinbndhh-lynq-test-live-29061122.dev.odoo.com';
    
    // Get partner ID for avatar (partner_id is a tuple [id, name] in Odoo)
    const partnerId = odooProfile.partner_id ? (Array.isArray(odooProfile.partner_id) ? odooProfile.partner_id[0] : odooProfile.partner_id) : null;
    
    // Use partner avatar if available, otherwise use profile avatar
    let avatarUrl: string | undefined;
    if (partnerId) {
      // Use public endpoint for partner avatar (no authentication required)
      avatarUrl = `${baseUrl}/lynq/image/partner/${partnerId}/avatar`;
    } else if (odooProfile.avatar) {
      // Fallback to profile avatar field
      avatarUrl = `${baseUrl}/web/image/lynq.profile/${odooProfile.id}/avatar`;
    }
    
    return {
      id: odooProfile.id,
      username: odooProfile.username,
      displayName: odooProfile.display_name,
      title: odooProfile.title || undefined,
      company: odooProfile.company || undefined,
      bio: odooProfile.bio || undefined,
      avatar: avatarUrl,
      coverImage: odooProfile.cover_image ? `${baseUrl}/web/image/lynq.profile/${odooProfile.id}/cover_image` : undefined,
      branding: {
        primaryColor: odooProfile.primary_color || '#3b82f6',
        // Always use public /lynq endpoint for logo (same as avatar) - no auth required
        logo: odooProfile.company 
          ? `${baseUrl}/lynq/image/profile/${odooProfile.id}/company_logo`
          : undefined,
      },
      contactInfo: {
        email: odooProfile.email || undefined,
        phone: odooProfile.phone || undefined,
        linkedin: odooProfile.linkedin || undefined,
        twitter: odooProfile.twitter || undefined,
      },
      qrCode: odooProfile.qr_code ? `${baseUrl}/web/image/lynq.profile/${odooProfile.id}/qr_code` : undefined,
      isPublic: odooProfile.is_public,
      aiConfig: {
        enabled: odooProfile.ai_enabled,
        personality: odooProfile.ai_personality || 'professional and friendly',
        greeting: odooProfile.ai_greeting || 'Hello! How can I help you today?',
        qualificationQuestions: odooProfile.ai_qualification_questions 
          ? odooProfile.ai_qualification_questions.split('\n').filter((q: string) => q.trim())
          : [],
        autoBooking: odooProfile.ai_auto_booking,
      },
    };
  }
}
