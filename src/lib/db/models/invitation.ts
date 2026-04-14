import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IInvitation extends Document {
  tenantId: mongoose.Types.ObjectId;
  email: string;
  token: string;
  role: 'admin' | 'user';
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  usedAt?: Date;
  odooProfileId?: number;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    token: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
    odooProfileId: { type: Number },
  },
  { timestamps: true }
);

InvitationSchema.index({ tenantId: 1, email: 1 });

const Invitation: Model<IInvitation> =
  mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema);

export default Invitation;
