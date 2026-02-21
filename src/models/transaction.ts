// src/models/transaction.ts
import { Schema, model, Document, Types } from 'mongoose'
export interface ITransaction extends Document {
  userId: Types.ObjectId // Ref → User (quien ejecuta la operación)
  type:
    | 'recarga' // Ingreso: recarga aprobada por admin
    | 'pago_pasaje_nfc' // Egreso: pago de pasaje vía NFC
    | 'pago_pasaje_qr' // Egreso: pago de pasaje vía QR
    | 'pago_pasaje_movil' // Egreso: pago directo desde saldo (sin tarjeta)
    | 'transferencia_enviada' // Egreso: transferencia P2P (quien envía)
    | 'transferencia_recibida' // Ingreso: transferencia P2P (quien recibe)
    | 'retiro' // Egreso: retiro de saldo
    | 'reembolso' // Ingreso: devolución
    | 'cobro_pasaje' // Ingreso al conductor: pasaje cobrado
  amount: number // Monto de la transacción (siempre positivo)
  previousBalance: number // Saldo antes de la operación
  newBalance: number // Saldo después de la operación
  // ── Referencia de pago (para recargas) ──
  paymentValidationId?: Types.ObjectId // Ref → PaymentValidation (si aplica)
  // ── Datos del viaje (para pagos de pasaje) ──
  routeId?: Types.ObjectId // Ref → Route
  driverId?: Types.ObjectId // Ref → Driver (conductor que cobró)
  tripId?: Types.ObjectId // Ref → Trip (viaje activo)
  fareType?: 'general' | 'estudiante' | 'tercera_edad'
  originalFare?: number // Tarifa antes de descuento
  discountApplied?: number // Monto del descuento aplicado
  // ── Datos de transferencia P2P ──
  targetUserId?: Types.ObjectId // Ref → User (destinatario en P2P)
  sourceUserId?: Types.ObjectId // Ref → User (remitente en P2P)
  // ── Datos NFC ──
  cardUid?: string // UID de la tarjeta NFC usada
  // ── Metadatos ──
  description?: string // Descripción legible de la transacción
  deviceInfo?: string // Información del dispositivo
  location?: {
    lat: number
    lng: number
  }
  createdAt: Date
  updatedAt: Date
}
const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'recarga',
        'pago_pasaje_nfc',
        'pago_pasaje_qr',
        'pago_pasaje_movil',
        'transferencia_enviada',
        'transferencia_recibida',
        'retiro',
        'reembolso',
        'cobro_pasaje',
      ],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    previousBalance: { type: Number, required: true },
    newBalance: { type: Number, required: true },
    paymentValidationId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentValidation',
    },
    routeId: { type: Schema.Types.ObjectId, ref: 'Route' },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip' },
    fareType: { type: String, enum: ['general', 'estudiante', 'tercera_edad'] },
    originalFare: { type: Number },
    discountApplied: { type: Number, default: 0 },
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    sourceUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    cardUid: { type: String },
    description: { type: String },
    deviceInfo: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true },
)
// Índices compuestos para consultas frecuentes TransactionSchema.index({ userId: 1, createdAt: -1 }) TransactionSchema.index({ driverId: 1, createdAt: -1 }) TransactionSchema.index({ type: 1, createdAt: -1 })
export const Transaction = model<ITransaction>('Transaction', TransactionSchema)
