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
      enum: ['free', 'solo', 'business'],
      default: 'free',
    },
    // Number of licensed seats (relevant for business plan)
    userCount: {
      type: Number,
      default: 1,
    },
    aiUsageLimit: {
      type: Number,
      default: 50,
    },
    aiUsageCount: {
      type: Number,
      default: 0,
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    stripeSubscriptionId: {
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

TenantSchema.index({ email: 1 }, { unique: true });

TenantSchema.methods.incrementAiUsage = async function () {
  this.aiUsageCount += 1;
  return this.save();
};

TenantSchema.methods.resetAiUsage = async function () {
  this.aiUsageCount = 0;
  return this.save();
};

TenantSchema.methods.hasAiQuota = function (): boolean {
  if (this.aiUsageLimit === -1) return true; // unlimited
  return this.aiUsageCount < this.aiUsageLimit;
};

const Tenant: Model<ITenant> =
  mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);

export default Tenant;
