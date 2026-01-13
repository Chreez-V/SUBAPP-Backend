import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

// TS Interface
export interface IUser extends Document {
  fullName: string
  email: string
  // Nota: Tu contraseña está anidada dentro de 'auth'. 
  // ¡IMPORTANTE! En tu controlador (auth.controller.ts), debes acceder con 'user.auth.password'
  auth: {
    password: string
  }
  role: 'passenger' | 'driver' | 'admin'
  credit?: number
  
  // ✅ CAMPOS PARA EL RESENTEO DE CONTRASEÑA
  resetPasswordToken?: string
  resetPasswordExpires?: Date

  createdAt: Date
  updatedAt: Date

  // Método para comparar la contraseña
  comparePassword(candidate: string): Promise<boolean>
}

// Mongoose Schema
const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },

    auth: {
      password: {
        type: String,
        required: true,
        minlength: 6,
        select: false, // previene que se seleccione por defecto
      },
    },

    role: {
      type: String,
      enum: ['passenger', 'driver', 'admin'],
      default: 'passenger',
    },

    credit: {
      type: Number,
      default: 0,
    },

    // ✅ CAMPOS AGREGADOS AL SCHEMA
    resetPasswordToken: { 
      type: String,
      required: false 
    },
    resetPasswordExpires: { 
      type: Date,
      required: false
    }
  },
  { 
    timestamps: true,
    // SOLUCIÓN AL ERROR 2790: Usamos el transformador para remover la contraseña y la aserción de tipo
    toJSON: {
      transform: function (doc, ret) {
        if (ret.auth) {
          delete (ret.auth as any).password // Usamos 'as any' para evitar el error de TS
        }
        return ret
      }
    }
  }
)

// Middleware: hash password before save
// SOLUCIÓN AL ERROR 2349: Se eliminó el argumento 'next' ya que el hook es asíncrono
UserSchema.pre('save', async function () {
  if (!this.isModified('auth.password')) return

  try {
    this.auth.password = await bcrypt.hash(this.auth.password, 10)
  } catch (error: any) {
    throw error // Lanza la excepción para detener el guardado
  }
})

// Compare password for login
UserSchema.methods.comparePassword = function (candidate: string) {
  if (!this.auth || !this.auth.password) {
      // Indica al desarrollador que debe usar .select('+auth.password')
      throw new Error("Password field is missing. Ensure it's explicitly selected in the query.");
  }
  return bcrypt.compare(candidate, this.auth.password)
}

// Export model
export const User = model<IUser>('User', UserSchema)

// -------------------------------------------------------
// QUERIES Y ACCIONES A LA BD
// -------------------------------------------------------

// Get all users
export const getUsers = async () => {
  return User.find().lean()
}

// Get user from session (JWT → usually contains email or id)
export const getUserBySession = async (sessionUser: { email: string }) => {
  return User.findOne({ email: sessionUser.email }).lean()
}

// Create user
export const createUser = async (data: {
  fullName: string
  email: string
  password: string
  role?: 'passenger' | 'driver' | 'admin'
  credit?: number
}) => {
  const user = new User({
    fullName: data.fullName,
    email: data.email,
    auth: {
      password: data.password, // será hasheada por el pre('save')
    },
    role: data.role ?? 'passenger',
    credit: data.credit ?? 0,
  })

  return user.save()
}

// Find user by email (for login)
export const findUserByEmail = async (email: string) => {
  // Para poder comparar la contraseña, forzamos la selección del campo
  return User.findOne({ email }).select('+auth.password')
}

// Get passengers with optional filters
export const getPassengers = async (filters: {
  email?: string
  fullName?: string
  creditMin?: number
  creditMax?: number
}) => {
  const query: any = { role: 'passenger' }

  if (filters.email) {
    query.email = { $regex: filters.email, $options: 'i' }
  }
  if (filters.fullName) {
    query.fullName = { $regex: filters.fullName, $options: 'i' }
  }
  if (filters.creditMin !== undefined || filters.creditMax !== undefined) {
    query.credit = {}
    if (filters.creditMin !== undefined) {
      query.credit.$gte = filters.creditMin
    }
    if (filters.creditMax !== undefined) {
      query.credit.$lte = filters.creditMax
    }
  }

  return User.find(query).select('-auth.password').lean()
}