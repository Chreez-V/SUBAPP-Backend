import { Schema, model, Document, Types } from "mongoose";

export enum DiscountType {
  ACADEMIC = 'estudiante',
  DISABILITY = 'discapacidad',
}

export enum DiscountStatus {
  PENDING = 'pendiente',
  APPROVED = 'aprobado',
  REJECTED = 'rechazado',
  EXPIRED = 'expirado',
}

export enum DocumentType {
  STUDENT_CARD = 'carnet_estudiantil',
  ENROLLMENT_CERTIFICATE = 'constancia_inscripcion',
  SENIOR_ID = 'cedula_senior',
}

export interface IDiscountProfile extends Document {
  userId: Types.ObjectId
  discountPercentage: number
  discountType: DiscountType
  status: DiscountStatus
  rejectionReason?: string
  documentType: DocumentType
  documentNumber: string
  documentImageUrl?: string
  institutionName?: string
  validFrom?: Date
  validUntil?: Date
  reviewedBy?: Types.ObjectId
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const discountProfileSchema = new Schema<IDiscountProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId, ref: 'User', required: true, index: true
    },
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(DiscountStatus),
      default: DiscountStatus.PENDING,
    },
    documentType: {
      type: String,
      enum: Object.values(DocumentType),
      required: true,
    },
    documentNumber: { type: String, required: true, trim: true },
    documentImageUrl: { type: String },
    institutionName: { type: String, trim: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
    validFrom: { type: Date },
    validUntil: { type: Date },
    discountPercentage: { type: Number, required: true, default: 50 },
  },
  { timestamps: true }
);

export const DiscountProfile = model<IDiscountProfile>('DiscountProfile',
  discountProfileSchema);