import mongoose, { Schema, Model } from 'mongoose';
import { IMeeting } from '@/types';

const MeetingSchema = new Schema<IMeeting>(
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
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      index: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
      default: 'UTC',
    },
    attendees: [
      {
        name: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
      },
    ],
    location: {
      type: String,
      trim: true,
    },
    videoLink: {
      type: String,
      trim: true,
    },
    calendarProvider: {
      type: String,
      enum: ['google', 'outlook', 'odoo'],
      required: true,
    },
    externalEventId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'cancelled', 'completed'],
      default: 'scheduled',
      index: true,
    },
    odooActivityId: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MeetingSchema.index({ tenantId: 1 });
MeetingSchema.index({ profileId: 1 });
MeetingSchema.index({ leadId: 1 });
MeetingSchema.index({ startTime: 1 });
MeetingSchema.index({ status: 1 });
MeetingSchema.index({ tenantId: 1, startTime: 1 });

const Meeting: Model<IMeeting> =
  mongoose.models.Meeting || mongoose.model<IMeeting>('Meeting', MeetingSchema);

export default Meeting;
