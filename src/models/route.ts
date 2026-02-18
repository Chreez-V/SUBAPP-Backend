import { Schema, model, Document, Types } from 'mongoose';

interface IPoint {
    lat: number;
    lng: number;
    name?: string;
}

/** One edge between two consecutive stops (OSRM segment) */
interface IEdge {
    fromStop: Types.ObjectId;
    toStop: Types.ObjectId;
    geometry: {
        type: string;
        coordinates: number[][];
    };
    distance: number; // km
    duration: number; // min
}

export interface IRoute extends Document {
    name: string;
    /** Ordered list of stop references that form this route */
    stops: Types.ObjectId[];
    /** OSRM edge segments between consecutive stops */
    edges: IEdge[];
    /** Full merged GeoJSON geometry for rendering */
    geometry: any;
    /** Total route distance in km */
    distance: number;
    /** Total estimated time in minutes */
    estimatedTime: number;
    /** "circular" (A-B-C-A) or "bidirectional" (A-B-C, same path back) */
    routeType: 'circular' | 'bidirectional';
    status: 'Active' | 'Inactive';

    // Legacy fields kept for backwards compatibility
    startPoint?: IPoint;
    endPoint?: IPoint;

    createdAt: Date;
    updatedAt: Date;
}

const PointSchema = new Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String },
}, { _id: false });

const EdgeSchema = new Schema({
    fromStop: { type: Schema.Types.ObjectId, ref: 'Stop', required: true },
    toStop: { type: Schema.Types.ObjectId, ref: 'Stop', required: true },
    geometry: { type: Schema.Types.Mixed, required: true },
    distance: { type: Number, required: true },
    duration: { type: Number, required: true },
}, { _id: false });

const RouteSchema = new Schema<IRoute>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        stops: [{
            type: Schema.Types.ObjectId,
            ref: 'Stop',
        }],
        edges: [EdgeSchema],
        geometry: {
            type: Schema.Types.Mixed,
            required: true,
        },
        distance: {
            type: Number,
            required: true,
        },
        estimatedTime: {
            type: Number,
            required: true,
        },
        routeType: {
            type: String,
            enum: ['circular', 'bidirectional'],
            default: 'bidirectional',
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
        // Legacy
        startPoint: { type: PointSchema },
        endPoint: { type: PointSchema },
    },
    { timestamps: true }
);

RouteSchema.index({ status: 1 });

export const Route = model<IRoute>('Route', RouteSchema);

// ---- QUERY FUNCTIONS ----
export const getRoutes = async (filter: any = {}) => {
    return Route.find(filter).populate('stops').lean();
};

export const getRouteById = async (id: string) => {
    return Route.findById(id).populate('stops').lean();
};

export const createRoute = async (data: Partial<IRoute>) => {
    const route = new Route(data);
    return route.save();
};

export const updateRoute = async (id: string, data: Partial<IRoute>) => {
    return Route.findByIdAndUpdate(id, data, { new: true }).populate('stops').lean();
};

export const deleteRoute = async (id: string) => {
    return Route.findByIdAndDelete(id).lean();
};

export const getActiveRoutes = async () => {
    return Route.find({ status: 'Active' }).populate('stops').lean();
};
