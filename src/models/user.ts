// TODO CREATE MONGOOSE USER SCHEMA HERE

/*
🧾 Ticket: Implementar modelos de Usuario con Mongoose

🎯 Objetivo: Crear el modelo User en Mongoose con su respectivo esquema, validaciones, tipos, índices y middlewares necesarios para la aplicación SUBA.
*/
import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

// TS Interface
export interface IUser extends Document {
  fullName: string
  email: string
  auth: {
    password: string
  }
  role: 'passenger' | 'driver' | 'admin'
  credit?: number
  createdAt: Date
  updatedAt: Date

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
  },
  { timestamps: true }
)

// Middleware: hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('auth.password')) return

  this.auth.password = await bcrypt.hash(this.auth.password, 10)
})

// Compare password for login
UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.auth.password)
}

// Remove password from JSON responses
UserSchema.methods.toJSON = function () {
  const obj = this.toObject()
  if (obj.auth) delete obj.auth.password
  return obj
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
  return User.findOne({ email })
}
