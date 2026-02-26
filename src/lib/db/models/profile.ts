import mongoose, { Schema, Model } from 'mongoose';
import { IProfile } from '@/types';

const ProfileSchema = new Schema<IProfile>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-_]+$/,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    company: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    avatar: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    branding: {
      primaryColor: {
        type: String,
        default: '#3b82f6',
      },
      logo: {
        type: String,
        default: '',
      },
      customDomain: String,
    },
    contactInfo: {
      email: String,
      phone: String,
      linkedin: String,
      twitter: String,
    },
    aiConfig: {
      enabled: {
        type: Boolean,
        default: true,
      },
      personality: {
        type: String,
        default: 'professional and friendly',
      },
      greeting: {
        type: String,
        default: 'Hello! How can I help you today?',
      },
      qualificationQuestions: {
        type: [String],
        default: ['What brings you here today?', 'Which industry are you in?'],
      },
      autoBooking: {
        type: Boolean,
        default: true,
      },
    },
    qrCode: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: 'en',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ProfileSchema.index({ tenantId: 1 });
ProfileSchema.index({ username: 1 }, { unique: true });
ProfileSchema.index({ userId: 1 });
ProfileSchema.index({ tenantId: 1, username: 1 }, { unique: true });

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;
