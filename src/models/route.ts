import { Schema, model, Document } from 'mongoose';

interface IPoint {
    lat: number;
    lng: number;
    name?: string;
}

export interface IRoute extends Document {
    name: string;
    startPoint: IPoint;
    endPoint: IPoint;
    geometry?: any;
    distance?: number;
    estimatedTime?: number;
    status: 'Active' | 'Inactive';
    createdAt: Date;
    updatedAt: Date;
}

const PointSchema = new Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String },
}, { _id: false });

const RouteSchema = new Schema<IRoute>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        startPoint: {
            type: PointSchema,
            required: true,
        },
        endPoint: {
            type: PointSchema,
            required: true,
        },
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
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
    },
    { timestamps: true }
);

export const Route = model<IRoute>('Route', RouteSchema);

// ---- QUERY FUNCTIONS ----
export const getRoutes = async (filter: any = {}) => {
    return Route.find(filter).lean();
};

export const getRouteById = async (id: string) => {
    return Route.findById(id).lean();
};

export const createRoute = async (data: Partial<IRoute>) => {
    const route = new Route(data);
    return route.save();
};

export const updateRoute = async (id: string, data: Partial<IRoute>) => {
    return Route.findByIdAndUpdate(id, data, { new: true }).lean();
};

export const deleteRoute = async (id: string) => {
    return Route.findByIdAndDelete(id).lean();
};

export const getActiveRoutes = async () => {
    return Route.find({ status: 'Active' }).lean();
};
