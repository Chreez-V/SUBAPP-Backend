import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface ISupport extends Document {
  fullName: string
  email: string
  auth: {
    password: string
  }
  role: 'support'
  status: 'Active' | 'Inactive'
  createdAt: Date
  updatedAt: Date
  comparePassword(candidate: string): Promise<boolean>
}

const SupportSchema = new Schema<ISupport>(
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
        select: false,
      },
    },
    role: {
      type: String,
      enum: ['support'],
      default: 'support',
      immutable: true,
    },
    
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        if (ret.auth) {
          delete (ret.auth as any).password
        }
        return ret
      },
    },
  },
)

SupportSchema.pre('save', async function () {
  this.auth.password = await bcrypt.hash(this.auth.password, 10)
})

SupportSchema.methods.comparePassword = function (candidate: string) {
  if (!this.auth || !this.auth.password) {
    throw new Error('Password field is missing. Ensure it\'s explicitly selected in the query.')
  }
  return bcrypt.compare(candidate, this.auth.password)
}

export const Support = model<ISupport>('Support', SupportSchema)

export const getSupports = async (filter: any = {}) => Support.find(filter).lean()

export const getSupportById = async (id: string) => Support.findById(id).lean()

export const createSupport = async (data: any) => {
  const support = new Support({
    ...data,
    auth: { password: data.password },
  })
  await support.save()
  // Return without password
  return Support.findById(support._id).select('-auth.password').lean()
}

export const updateSupport = async (id: string, data: Partial<ISupport>) => {
  return Support.findByIdAndUpdate(id, data, { new: true }).lean()
}

export const findSupportByEmail = async (email: string) => {
  return Support.findOne({ email }).select('+auth.password')
}

export const deleteSupport = async (id: string) => {
  return Support.findByIdAndUpdate(id, { status: 'Inactive' }, { new: true }).lean()
}

export const permanentDeleteSupport = async (id: string) => {
  return Support.findByIdAndDelete(id)
}