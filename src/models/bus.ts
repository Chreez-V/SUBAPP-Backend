import { Schema, model, Document, Types } from 'mongoose'

export interface IBus extends Document {
  plate: string
  brand: string
  vehicleModel: string
  year: number
  capacity: number
  status: 'Activo' | 'Inactivo' | 'Mantenimiento'
  assignedRouteId?: Types.ObjectId
  assignedDriverId?: Types.ObjectId
  color?: string
  fleetNumber?: string
  createdAt: Date
  updatedAt: Date
}

const BusSchema = new Schema<IBus>(
  {
    plate: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleModel: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1990,
      max: new Date().getFullYear() + 1,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['Activo', 'Inactivo', 'Mantenimiento'],
      default: 'Activo',
    },
    assignedRouteId: {
      type: Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    assignedDriverId: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    color: {
      type: String,
      trim: true,
    },
    fleetNumber: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
  },
  { timestamps: true },
)

export const Bus = model<IBus>('Bus', BusSchema)

// ---- QUERY HELPERS ----

export const getBuses = async (filter: any = {}) => {
  return Bus.find(filter)
    .populate('assignedRouteId', 'name')
    .populate('assignedDriverId', 'name email')
    .lean()
}

export const getBusById = async (id: string) => {
  return Bus.findById(id)
    .populate('assignedRouteId', 'name')
    .populate('assignedDriverId', 'name email')
    .lean()
}

export const getBusByPlate = async (plate: string) => {
  return Bus.findOne({ plate: plate.toUpperCase() }).lean()
}

export const createBus = async (data: Partial<IBus>) => {
  const bus = new Bus(data)
  return bus.save()
}

export const updateBus = async (id: string, data: Partial<IBus>) => {
  return Bus.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean()
}

export const deleteBus = async (id: string) => {
  return Bus.findByIdAndDelete(id).lean()
}
