import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'


/* TS Admin's interface */
export interface IAdmin extends Document {
  fullName: string
  email: string
  auth: {
    password: string
  }
  role: 'admin'

  phone?: string
  //permissions?: string[] // Admin's permissions (Example: delete,add users...)
  lastLogin?: Date

  resetPasswordToken?: string
  resetPasswordExpires?: Date

  createdAt: Date
  updatedAt: Date

  comparePassword(candidate: string): Promise<boolean>
}


const AdminSchema = new Schema<IAdmin>(
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
    phone: {
      type: String,
      trim: true,
    },
    auth: {
      password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
      },
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
    // permissions: [{
    //   type: String,
    //   default: ['users:read', 'users:write']
    // }],

    lastLogin: {
      type: Date,
    },

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
    toJSON: {
      transform: function (doc, ret) {
        if (ret.auth) {
          delete (ret.auth as any).password
        }
        return ret
      }
    }
  }
)


AdminSchema.pre('save', async function () {
  if (!this.isModified('auth.password')) return

  try {
    this.auth.password = await bcrypt.hash(this.auth.password, 10)
  } catch (error: any) {
    throw error
  }
})

AdminSchema.methods.comparePassword = function (candidate: string) {
  if (!this.auth || !this.auth.password) {
    throw new Error("Password field is missing. Ensure it's explicitly selected in the query.");
  }
  return bcrypt.compare(candidate, this.auth.password)
}

export const Admin = model<IAdmin>('Admin', AdminSchema)


export const getAdmins = async () => {
  return Admin.find().lean()
}

export const getAdminBySession = async (sessionAdmin: { email: string }) => {
  return Admin.findOne({ email: sessionAdmin.email }).lean()
}

export const createAdmin = async (data: {
  fullName: string
  email: string
  password: string
  phone?: string
  //permissions?: string[]
}) => {
  const admin = new Admin({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    auth: {
      password: data.password,
    },
    /*permissions: data.permissions ?? ['users:read', 'users:write'], */

  })

  return admin.save()
}

export const findAdminByEmail = async (email: string) => {
  return Admin.findOne({ email }).select('+auth.password')
}