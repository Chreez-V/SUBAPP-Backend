import {Schema,model,Document,Types} from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IBusCollector extends Document {
    fullName: string;
    email: string;
    phone: string;
    cedula: string; //govId
    birthDate?: Date;  
    assignedBusId: string;
    status: 'active' | 'inactive';
    role: "Bus collector"; 
    createdAt: Date;
    updatedAt: Date;

     resetPasswordToken?: string;
     resetPasswordExpires?: Date;
    }

    const CollectorSchema = new Schema<IBusCollector>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
      cedula: {
      type: String,
      trim: true,
      sparse: true, 
      unique: true,
    },
      birthDate: {
      type: Date,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    assignedBusId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    role: {
      type: String,
      default: "Bus collector",
    },
     resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  
  { timestamps: true }
);

//BUS-COLLECTOR REPOSITORIES
export const Collector = model<IBusCollector>('Collector', CollectorSchema);

export const createCollector = async (data: Partial<IBusCollector>) => {
  const newCollector = new Collector(data);
  return await newCollector.save();
};

export const getAllCollectors = async () => {
  return Collector.find().lean();
};

export const getCollectorById = async (id: string) => {
  return Collector.findById(id).lean();
};

export const getCollectorByCedula = async (cedula: string) => {
  return await Collector.findOne({ cedula }).lean();
};

export const getCollectorsByStatus = async (status: 'active' | 'inactive') => {
  return await Collector.find({ status }).lean();
};

export const updateCollector = async (id: string, updateData: Partial<IBusCollector>) => {
  return Collector.findByIdAndUpdate(id, updateData, { new: true, runValidators: true});
};

export const assignBusToCollector = async (cedula: string, busId: string) => {
  return await Collector.findOneAndUpdate(
    {cedula:cedula},
    { 
      assignedBusId: busId,
      status: 'active' 
    },
    { new: true, runValidators: true }
  ).lean();
};

export const deleteCollector = async (id: string) => {
  return Collector.findByIdAndDelete(id);
};

export const getCollectorsByBusId = async (busId: string) => {
  return Collector.find({ assignedBusId: busId }).lean();
};