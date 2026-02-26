import { Types } from 'mongoose';

// Common types
export type ObjectId = Types.ObjectId;

// Tenant types
export interface ITenant {
  _id: ObjectId;
  name: string;
  email: string;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  aiUsageLimit: number;
  aiUsageCount: number;
  stripeCustomerId?: string;
  odooConfig?: {
    url: string;
    database: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
  calendarIntegrations: Array<{
    provider: 'google' | 'outlook' | 'odoo';
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface IUser {
  _id: ObjectId;
  tenantId: ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// Profile types
export interface IProfile {
  id?: number | string; // Odoo uses id
  _id?: ObjectId; // MongoDB compatibility
  tenantId?: ObjectId | string;
  userId?: ObjectId | number;
  username: string;
  displayName: string;
  title: string;
  company: string;
  bio: string;
  avatar: string;
  coverImage: string;
  branding: {
    primaryColor: string;
    logo: string;
    customDomain?: string;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    linkedin?: string;
    twitter?: string;
  };
  aiConfig: {
    enabled: boolean;
    personality: string;
    greeting: string;
    qualificationQuestions: string[];
    autoBooking: boolean;
  };
  qrCode: string;
  isPublic: boolean;
  language: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Conversation types
export interface IConversation {
  _id: ObjectId;
  tenantId: ObjectId;
  profileId: ObjectId;
  visitorId: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'function';
    content: string;
    timestamp: Date;
    functionCall?: {
      name: string;
      arguments: object;
      result?: any;
    };
  }>;
  leadInfo?: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    intent?: string;
  };
  status: 'active' | 'qualified' | 'booked' | 'escalated' | 'closed';
  bookingResult?: {
    meetingId: ObjectId;
    bookedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Lead types
export interface ILead {
  _id: ObjectId;
  tenantId: ObjectId;
  profileId: ObjectId;
  conversationId?: ObjectId;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  intent?: string;
  source: 'qr' | 'nfc' | 'link' | 'chat';
  tags: string[];
  notes: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  score?: number;
  odooSyncStatus?: {
    synced: boolean;
    odooContactId?: number;
    odooLeadId?: number;
    lastSyncAt?: Date;
    error?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Meeting types
export interface IMeeting {
  _id: ObjectId;
  tenantId: ObjectId;
  profileId: ObjectId;
  leadId?: ObjectId;
  conversationId?: ObjectId;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  attendees: Array<{
    name: string;
    email: string;
  }>;
  location?: string;
  videoLink?: string;
  calendarProvider: 'google' | 'outlook' | 'odoo';
  externalEventId?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  odooActivityId?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics types
export interface IAnalytics {
  _id: ObjectId;
  tenantId: ObjectId;
  profileId: ObjectId;
  eventType: 'view' | 'qr_scan' | 'nfc_scan' | 'chat_start' | 'chat_qualified' | 'meeting_booked';
  metadata?: object;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  timestamp: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Session types
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: 'admin' | 'user';
}

export interface Session {
  user: SessionUser;
  expires: string;
}
