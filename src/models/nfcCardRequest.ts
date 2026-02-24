import { Schema, model, Document, Types } from 'mongoose'

export interface INfcCardRequest extends Document {
    userId: Types.ObjectId
    status: 'pendiente_pago' | 'pendiente_revision' | 'aprobada' | 'vinculada' | 'rechazada'
    paymentValidationId?: Types.ObjectId 
    emissionAmount: number
    reviewedBy?: Types.ObjectId
    reviewedAt?: Date
    rejectionReason?: string
    linkedCardUid?: string
    linkedAt?: Date
    createdAt: Date
    updatedAt: Date
}

const NfcCardRequestSchema = new Schema<INfcCardRequest>(
    {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
        type: String,
        enum: ['pendiente_pago', 'pendiente_revision', 'aprobada', 'vinculada', 'rechazada'],
        default: 'pendiente_pago',
    },
    // Esto se reemplazará con la parte de Sebastian que maneja la validación de pagos
    paymentValidationId: { type: Schema.Types.ObjectId, ref: 'PaymentValidation' },
    emissionAmount: { type: Number, required: true, default: 50 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
    linkedCardUid: { type: String },
    linkedAt: { type: Date },
    },
    { timestamps: true }
)

export const NfcCardRequest = model<INfcCardRequest>('NfcCardRequest', NfcCardRequestSchema)