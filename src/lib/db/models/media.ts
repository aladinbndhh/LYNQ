import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMedia extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  type: 'avatar' | 'logo' | 'banner';
  data: Buffer;
  contentType: string;
  size: number;
  createdAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    tenantId:   { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User',   required: true },
    type:       { type: String, enum: ['avatar', 'logo', 'banner'], required: true },
    data:       { type: Buffer, required: true },
    contentType:{ type: String, required: true },
    size:       { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Media as mongoose.Model<IMedia> ||
  mongoose.model<IMedia>('Media', MediaSchema);
