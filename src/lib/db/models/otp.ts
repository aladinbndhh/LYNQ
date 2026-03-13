import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  used: boolean;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-delete expired docs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);
export default Otp;
