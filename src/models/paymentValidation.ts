import { Schema, model, Document, Types } from 'mongoose'

export interface IPaymentValidation extends Document {
  userId: Types.ObjectId // Ref User que solicita la recarga
  type: 'recarga' | 'pago_tarjeta_nfc' // Tipo de validación
  
  // Datos del pago externo
  referenciaPago: string // Número de referencia del pago (pago móvil/transferencia)
  monto: number // Monto declarado por el usuario
  banco?: string // Banco origen (opcional)
  fechaPago?: Date // Fecha en que realizó el pago
  comprobantUrl?: string // URL de imagen del comprobante (opcional)
  
  // Estado de la validación
  status: 'pendiente' | 'aprobado' | 'rechazado'
  
  // Revisión administrativa
  reviewedBy?: Types.ObjectId // Ref Admin que revisó
  reviewedAt?: Date
  rejectionReason?: string // Motivo de rechazo
  
  // Relación con NFC (si es pago de tarjeta)
  nfcRequestId?: Types.ObjectId // Ref NfcCardRequest (si pagó por tarjeta NFC)
  
  createdAt: Date
  updatedAt: Date
}

const PaymentValidationSchema = new Schema<IPaymentValidation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['recarga', 'pago_tarjeta_nfc'], required: true },
    referenciaPago: { type: String, required: true, trim: true },
    monto: { type: Number, required: true, min: 0 },
    banco: { type: String, trim: true },
    fechaPago: { type: Date },
    comprobantUrl: { type: String },
    status: {
      type: String,
      enum: ['pendiente', 'aprobado', 'rechazado'],
      default: 'pendiente',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
    nfcRequestId: { type: Schema.Types.ObjectId, ref: 'NfcCardRequest' },
  },
  { timestamps: true }
)

// Índices para optimizar búsquedas del panel admin y evitar referencias duplicadas
PaymentValidationSchema.index({ status: 1, createdAt: 1 })
PaymentValidationSchema.index({ referenciaPago: 1 }, { unique: true })

export const PaymentValidation = model<IPaymentValidation>(
  'PaymentValidation',
  PaymentValidationSchema
)