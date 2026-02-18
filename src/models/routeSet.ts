import { Schema, model, Document, Types } from 'mongoose';

export interface IRouteSet extends Document {
  name: string;
  description?: string;
  /** Routes that belong to this set — all are alternatives of each other */
  routes: Types.ObjectId[];
  /** The currently active route within this set (only one at a time) */
  activeRoute?: Types.ObjectId;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const RouteSetSchema = new Schema<IRouteSet>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    routes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Route',
      },
    ],
    activeRoute: {
      type: Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

RouteSetSchema.index({ status: 1 });

export const RouteSet = model<IRouteSet>('RouteSet', RouteSetSchema);
