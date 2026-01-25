import { Schema, model, Document } from 'mongoose';

interface IPoint {
    lat: number;
    lng: number;
    nombre?: string;
}
export interface IRoute extends Document {
    nombre: string;
    puntoInicio: IPoint;
    puntoFinal: IPoint;
    geometry?: any;
    distancia?: number; // lo cambié a number
    tiempoEstimado?: number; // lo cambié a number
    estado: 'Activa' | 'Inactiva';
    // precio?: number;
    createdAt: Date;
    updatedAt: Date;
}

const PointSchema = new Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    nombre: { type: String },
}, { _id: false });

const RouteSchema = new Schema<IRoute>(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
        },
        puntoInicio: {
            type: PointSchema,
            required: true,
        },
        puntoFinal: {
            type: PointSchema,
            required: true,
        },
        geometry: {
            type: Schema.Types.Mixed,
            required: true,
        },
        distancia: {
            type: Number,
            required: true,
        },
        tiempoEstimado: {
            type: Number,
            required: true,
        },
        estado: {
            type: String,
            enum: ['Activa', 'Inactiva'],
            default: 'Activa',
        },
        // precio: {
        //     type: Number,
        //     default: 1.0,
        // },
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
    return Route.find({ estado: 'Activa' }).lean();
};
