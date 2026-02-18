import { Schema, model, Document } from 'mongoose'; 
export interface IBusFare extends Document { 
  amount: number; 
  createdAt: Date; 
  updatedAt: Date; 
} 
const BusFareSchema = new Schema<IBusFare>( 
  { 
    amount: { 
      type: Number, 
      required: true, 
    }, 
  }, 
  { timestamps: true } 
); 

export const BusFare = model<IBusFare>('BusFare', BusFareSchema); 
// ---- QUERY FUNCTIONS ---- 
export const getBusFares = async (filter: any = {}) => { 
return BusFare.find(filter).lean(); 
}; 
export const getBusFareById = async (id: string) => { 
return BusFare.findById(id).lean(); 
}; 
export const createBusFare = async (data: Partial<IBusFare>) => { 
const busFare = new BusFare(data); 
return busFare.save(); 
}; 
export const updateBusFare = async (id: string, data: Partial<IBusFare>) => { 
return BusFare.findByIdAndUpdate(id, data, { new: true }).lean(); 
}; 
export const deleteBusFare = async (id: string) => { 
return BusFare.findByIdAndDelete(id).lean(); 
};