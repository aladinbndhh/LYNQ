import mongoose, { Schema, Model } from 'mongoose';
import { ITenant } from '@/types';

const TenantSchema = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    subscriptionTier: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    aiUsageLimit: {
      type: Number,
      default: 100, // Free tier: 100 AI messages/month
    },
    aiUsageCount: {
      type: Number,
      default: 0,
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    odooConfig: {
      url: String,
      database: String,
      accessToken: String,
      refreshToken: String,
      expiresAt: Date,
    },
    calendarIntegrations: [
      {
        provider: {
          type: String,
          enum: ['google', 'outlook', 'odoo'],
        },
        accessToken: String,
        refreshToken: String,
        expiresAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
TenantSchema.index({ email: 1 }, { unique: true });

// Methods
TenantSchema.methods.incrementAiUsage = async function () {
  this.aiUsageCount += 1;
  return this.save();
};

TenantSchema.methods.resetAiUsage = async function () {
  this.aiUsageCount = 0;
  return this.save();
};

TenantSchema.methods.hasAiQuota = function (): boolean {
  return this.aiUsageCount < this.aiUsageLimit;
};

const Tenant: Model<ITenant> =
  mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);

export default Tenant;
