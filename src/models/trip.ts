import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  driverId: mongoose.Types.ObjectId; // Referencia al Usuario (Conductor)
  routeIdentifier: string;           // Nombre o ID de la ruta 
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'cancelled';
  vehiclePlate?: string;             // Opcional: Placa del bus que está usando ese día
}

const TripSchema: Schema = new Schema({
  
  driverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  routeIdentifier: { type: String, required: true },
  
  // Guardamos la placa solo como texto informativo para el reporte
  vehiclePlate: { type: String }, 

  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'cancelled'], 
    default: 'active' 
  },
}, { timestamps: true });

export default mongoose.model<ITrip>('Trip', TripSchema);