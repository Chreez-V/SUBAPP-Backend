import { Schema, model, Document } from 'mongoose';

// TypeScript Interface
export interface IRoute extends Document {
  name: string;
  startPoint: {
    lat: number;
    lng: number;
    address?: string;
  };
  endPoint: {
    lat: number;
    lng: number;
    address?: string;
  };
  geometry: {
    type: string;
    coordinates: number[][];
  };
  distance: number; // in km
  duration: number; // in minutes
  fare?: number;
  isActive: boolean;
  schedules?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const RouteSchema = new Schema<IRoute>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    startPoint: {
      lat: { 
        type: Number, 
        required: true,
        min: -90,
        max: 90
      },
      lng: { 
        type: Number, 
        required: true,
        min: -180,
        max: 180
      },
      address: String,
    },
    endPoint: {
      lat: { 
        type: Number, 
        required: true,
        min: -90,
        max: 90
      },
      lng: { 
        type: Number, 
        required: true,
        min: -180,
        max: 180
      },
      address: String,
    },
    geometry: {
      type: { 
        type: String, 
        enum: ['LineString'], 
        default: 'LineString' 
      },
      coordinates: {
        type: [[Number]],
        required: true
      }
    },
    distance: {
      type: Number,
      required: true,
      min: 0
    },
    duration: {
      type: Number,
      required: true,
      min: 0
    },
    fare: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    schedules: [String],
  },
  {
    timestamps: true,
  }
);

// Geospatial indexes for location-based queries
RouteSchema.index({ geometry: '2dsphere' });
RouteSchema.index({ 'startPoint.lat': 1, 'startPoint.lng': 1 });
RouteSchema.index({ isActive: 1 });

export const Route = model<IRoute>('Route', RouteSchema);
