import mongoose, { Schema, Model } from 'mongoose';
import { IConversation } from '@/types';

const ConversationSchema = new Schema<IConversation>(
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
    visitorId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['system', 'user', 'assistant', 'function'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        functionCall: {
          name: String,
          arguments: Schema.Types.Mixed,
          result: Schema.Types.Mixed,
        },
      },
    ],
    leadInfo: {
      name: String,
      company: String,
      email: String,
      phone: String,
      intent: String,
    },
    status: {
      type: String,
      enum: ['active', 'qualified', 'booked', 'escalated', 'closed'],
      default: 'active',
    },
    bookingResult: {
      meetingId: {
        type: Schema.Types.ObjectId,
        ref: 'Meeting',
      },
      bookedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ConversationSchema.index({ tenantId: 1 });
ConversationSchema.index({ profileId: 1 });
ConversationSchema.index({ visitorId: 1 });
ConversationSchema.index({ createdAt: -1 });
ConversationSchema.index({ status: 1 });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
