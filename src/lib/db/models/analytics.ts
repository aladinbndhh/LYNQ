import mongoose, { Schema, Model } from 'mongoose';
import { IAnalytics } from '@/types';

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['view', 'qr_scan', 'nfc_scan', 'chat_start', 'chat_qualified', 'meeting_booked'],
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    referrer: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
AnalyticsSchema.index({ tenantId: 1 });
AnalyticsSchema.index({ profileId: 1 });
AnalyticsSchema.index({ eventType: 1 });
AnalyticsSchema.index({ timestamp: -1 });
AnalyticsSchema.index({ tenantId: 1, profileId: 1, eventType: 1, timestamp: -1 });

const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics ||
  mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics;
