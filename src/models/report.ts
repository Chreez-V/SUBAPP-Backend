import { Schema, model, Document, Types } from 'mongoose';

/**
 * Enum of predefined report reasons a driver can select.
 * If the driver picks 'otro', the `customReason` field is used.
 */
export const REPORT_REASONS = [
  'via_deteriorada',        // Vía deteriorada / huecos
  'inundacion',             // Inundación / acumulación de agua
  'derrumbe',               // Derrumbe / deslizamiento de tierra
  'accidente_vial',         // Accidente vial bloqueando la vía
  'obra_en_construccion',   // Obra en construcción
  'cierre_policial',        // Cierre policial / militar
  'arbol_caido',            // Árbol caído / obstrucción
  'falla_semaforo',         // Falla de semáforo
  'protesta',               // Protesta / manifestación
  'otro',                   // Otro (requiere customReason)
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export interface IReport extends Document {
  /** The route being reported as impassable */
  route: Types.ObjectId;
  /** The driver who submitted the report */
  driver: Types.ObjectId;
  /** Predefined reason category */
  reason: ReportReason;
  /** Free-text description when reason is 'otro' */
  customReason?: string;
  /** Additional notes from the driver */
  notes?: string;
  /** Admin resolution status */
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  /** If a route switch was made, which route was activated */
  switchedToRoute?: Types.ObjectId;
  /** Admin who resolved the report */
  resolvedBy?: Types.ObjectId;
  /** Comment from the admin upon resolution */
  resolutionNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    route: {
      type: Schema.Types.ObjectId,
      ref: 'Route',
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    reason: {
      type: String,
      enum: REPORT_REASONS,
      required: true,
    },
    customReason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'resolved'],
      default: 'pending',
    },
    switchedToRoute: {
      type: Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    resolutionNotes: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

ReportSchema.index({ status: 1 });
ReportSchema.index({ route: 1 });
ReportSchema.index({ driver: 1 });
ReportSchema.index({ createdAt: -1 });

export const Report = model<IReport>('Report', ReportSchema);
