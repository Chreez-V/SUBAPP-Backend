import { Schema, model, Document } from 'mongoose';

export interface IStop extends Document {
  name: string;
  description?: string;
  location: {
    lat: number;
    lng: number;
  };
  /** Optional: address resolved from reverse geocoding or manually entered */
  address?: string;
  /** Reference name visible in the SUBA app */
  referenceLabel?: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const StopSchema = new Schema<IStop>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: {
      type: String,
      trim: true,
    },
    referenceLabel: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate stops at the same location
StopSchema.index({ 'location.lat': 1, 'location.lng': 1 });
StopSchema.index({ status: 1 });

export const Stop = model<IStop>('Stop', StopSchema);
