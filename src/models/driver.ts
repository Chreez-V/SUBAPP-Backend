import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IDriver extends Document {
  nombre: string
  email: string
  auth: {
    password: string
  }
  role: 'driver' //Rol fijo para conductores
  numeroLicencia: string // Puede ser licencia o ID de conductor en algunos casos
  telefono: string
  estado: 'Activo' | 'Inactivo'
  resetPasswordToken?: string //Token para el password reset
  resetPasswordExpires?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidate: string): Promise<boolean>
}

// Esquema del conductor para que mongoose lo entienda

const DriverSchema = new Schema<IDriver>(
  {
    nombre: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true, // Para que no puedan registrarse dos conductores con el mismo email
      lowercase: true, // Para que el email sea en minúsculas
      trim: true, // Para que el email no tenga espacios en blanco
      match: [/^\S+@\S+\.\S+$/, 'Formato de email inválido'], // Regex para validar el formato del email
    },
    auth: {
      password: { type: String, required: true, minlength: 6, select: false },
    },
    role: {
      type: String,
      enum: ['driver'],
      default: 'driver',
      immutable: true,
    },
    numeroLicencia: { type: String, required: true, unique: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    estado: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        if (ret.auth) delete (ret.auth as any).password // Usamos 'as any' para evitar el error de TS ()
        //  Nunca enviamos la contraseña al frontend
        return ret
      },
    },
  },
)

// Middleware para hashear la contraseña antes de guardar el conductor

DriverSchema.pre('save', async function () {
  if (!this.isModified('auth.password')) return
  try {
    this.auth.password = await bcrypt.hash(this.auth.password, 10)
  } catch (error: any) {
    throw error
  }
})

// Método para comparar contraseñas durante el login
DriverSchema.methods.comparePassword = function (candidate: string) {
  if (!this.auth || !this.auth.password) {
    throw new Error('El campo password falta en la consulta.')
  }
  return bcrypt.compare(candidate, this.auth.password)
}

export const Driver = model<IDriver>('Driver', DriverSchema)

//Helpers

export const getDrivers = async (filter: any = {}) => Driver.find(filter).lean() //Consulta para obtener todos los conductores

export const getDriverById = async (id: string) => Driver.findById(id).lean() //Consulta para obtener un conductor por su ID

export const createDriver = async (data: any) => {
  //Funcion para crear un nuevo conductor
  const driver = new Driver({
    ...data,
    auth: { password: data.password },
  })
  return driver.save()
}

export const updateDriver = async (id: string, data: Partial<IDriver>) => {
  //Actualizacion de datos de un conductor
  return Driver.findByIdAndUpdate(id, data, { new: true }).lean()
}

export const getDriverByLicencia = async (numeroLicencia: string) => {
  //Obtener un conductor por su numero de licencia
  return Driver.findOne({ numeroLicencia }).lean()
}
