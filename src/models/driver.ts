import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IDriver extends Document {
  name: string
  email: string
  auth: {
    password: string
  }
  role: 'driver' // Fixed role for drivers
  licenseNumber: string // Driver's license number or ID
  phone: string
  status: 'Active' | 'Inactive'
  resetPasswordToken?: string // Token for password reset
  resetPasswordExpires?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidate: string): Promise<boolean>
}

// Driver schema for mongoose

const DriverSchema = new Schema<IDriver>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true, // Prevent duplicate driver emails
      lowercase: true, // Store email in lowercase
      trim: true, // Remove whitespace
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'], // Email validation regex
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
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        if (ret.auth) delete (ret.auth as any).password // Using 'as any' to avoid TS error
        // Never send password to frontend
        return ret
      },
    },
  },
)

// Middleware to hash password before saving driver

DriverSchema.pre('save', async function () {
  if (!this.isModified('auth.password')) return
  try {
    this.auth.password = await bcrypt.hash(this.auth.password, 10)
  } catch (error: any) {
    throw error
  }
})

// Method to compare passwords during login
DriverSchema.methods.comparePassword = function (candidate: string) {
  if (!this.auth || !this.auth.password) {
    throw new Error('Password field is missing from query.')
  }
  return bcrypt.compare(candidate, this.auth.password)
}

export const Driver = model<IDriver>('Driver', DriverSchema)

// Helpers

export const getDrivers = async (filter: any = {}) => Driver.find(filter).lean() // Get all drivers

export const getDriverById = async (id: string) => Driver.findById(id).lean() // Get driver by ID

export const getDriverByLicenseNumber = async (licenseNumber: string) => {
  // Get driver by license number
  return Driver.findOne({ licenseNumber }).lean()
}

export const createDriver = async (data: any) => {
  // Create new driver
  const driver = new Driver({
    ...data,
    auth: { password: data.password },
  })
  return driver.save()
}

export const updateDriver = async (id: string, data: Partial<IDriver>) => {
  // Update driver data
  return Driver.findByIdAndUpdate(id, data, { new: true }).lean()
}
