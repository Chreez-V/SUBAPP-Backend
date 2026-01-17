import { Schema, model, Document } from 'mongoose'

export interface IBusFare extends Document {
  farePrice: number
  currency: string
}

const BusFareSchema = new Schema<IBusFare>(
  {
    farePrice: {
      type: Number,
      required: true,
      default: 0
    },
    currency: {
      type: String,
      default: 'Bs' 
    }
  },
  { timestamps: true }
)

export const BusFare = model<IBusFare>('BusFare', BusFareSchema)

export const getGlobalFare = async () => {
  return BusFare.findOne().lean()
}

export const updateGlobalFare = async (price: number) => {
  return BusFare.findOneAndUpdate(
    {}, 
    { farePrice: price },
    { upsert: true, new: true }
  )
}