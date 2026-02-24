import { Schema, model, Document, Types } from 'mongoose'

export interface INfcCard extends Document {
    cardUid: string
    userId: Types.ObjectId
    status: 'activa' | 'bloqueada' | 'perdida' | 'desvinculada'
    issuedAt: Date
    lastUsedAt?: Date
    blockedReason?: string
    requestId: Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

const NfcCardSchema = new Schema<INfcCard>(
    {
    cardUid: { type: String, required: true, unique: true, trim: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
        type: String,
        enum: ['activa', 'bloqueada', 'perdida', 'desvinculada'],
        default: 'activa',
    },
    issuedAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date },
    blockedReason: { type: String },
    requestId: { type: Schema.Types.ObjectId, ref: 'NfcCardRequest', required: true },
    },
    { timestamps: true }
)

// Restricción: un usuario solo puede tener UNA tarjeta activa
NfcCardSchema.index(
    { userId: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'activa' } }
)

export const NfcCard = model<INfcCard>('NfcCard', NfcCardSchema)