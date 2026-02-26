import mongoose, { Schema, Model } from 'mongoose';
import { ILead } from '@/types';

const LeadSchema = new Schema<ILead>(
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
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    intent: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ['qr', 'nfc', 'link', 'chat'],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
      default: 'new',
      index: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    odooSyncStatus: {
      synced: {
        type: Boolean,
        default: false,
      },
      odooContactId: Number,
      odooLeadId: Number,
      lastSyncAt: Date,
      error: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
LeadSchema.index({ tenantId: 1 });
LeadSchema.index({ profileId: 1 });
LeadSchema.index({ email: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ tenantId: 1, email: 1 });

const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
