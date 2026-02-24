import { Schema, model, Document, Types } from 'mongoose'

export interface IBus extends Document {
  placa: string              // Placa del autobús (única)
  marca: string              // Marca (ej: Mercedes-Benz, Yutong)
  modelo: string             // Modelo (ej: OF-1721, ZK6116HG)
  anio: number               // Año de fabricación
  capacidad: number          // Capacidad de pasajeros
  status: 'Activo' | 'Inactivo' | 'Mantenimiento'
  assignedRouteId?: Types.ObjectId   // Ref → Route (ruta asignada)
  assignedDriverId?: Types.ObjectId  // Ref → Driver (conductor asignado)
  color?: string
  numeroInterno?: string     // Número interno de la flota
  createdAt: Date
  updatedAt: Date
}

const BusSchema = new Schema<IBus>(
  {
    placa: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    marca: {
      type: String,
      required: true,
      trim: true,
    },
    modelo: {
      type: String,
      required: true,
      trim: true,
    },
    anio: {
      type: Number,
      required: true,
      min: 1990,
      max: new Date().getFullYear() + 1,
    },
    capacidad: {
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
    numeroInterno: {
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

export const getBusByPlaca = async (placa: string) => {
  return Bus.findOne({ placa: placa.toUpperCase() }).lean()
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
