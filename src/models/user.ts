import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

// TS Interface
export interface IUser extends Document {
  fullName: string;
  email: string;
  // Nota: Tu contraseña está anidada dentro de 'auth'.
  // ¡IMPORTANTE! En tu controlador (auth.controller.ts), debes acceder con 'user.auth.password'
  auth: {
    password: string;
  };
  role: "passenger" | "driver" | "admin";
  credit?: number;
  profilePictureUrl?: string;

  // ✅ KYC LIGHT — Identidad y Perfil
  // Requeridos para operar con el sistema de pagos (wallet, NFC, QR)
  // Validación Just-in-Time: se verifican en cada controlador de pago
  cedula?: string;              // Cédula de identidad (ej: "V-12345678")
  birthDate?: Date;             // Fecha de nacimiento
  phone?: string;               // Teléfono móvil (ej: "+58 412 1234567")
  idDocumentImageUrl?: string;  // URL de la foto/scan del documento de identidad
  isProfileComplete: boolean;   // true cuando cedula + birthDate + phone están presentes

  // ✅ CAMPOS PARA EL RESETEO DE CONTRASEÑA
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  createdAt: Date;
  updatedAt: Date;

  // Método para comparar la contraseña
  comparePassword(candidate: string): Promise<boolean>;
}

// Mongoose Schema
const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    auth: {
      password: {
        type: String,
        required: true,
        minlength: 6,
        select: false, // previene que se seleccione por defecto
      },
    },

    role: {
      type: String,
      enum: ["passenger", "driver", "admin"],
      default: "passenger",
    },

    credit: {
      type: Number,
      default: 0,
    },

    profilePictureUrl: {
      type: String,
      default: null,
    },

    // ✅ KYC LIGHT — Identidad y Perfil
    cedula: {
      type: String,
      trim: true,
      sparse: true,  // Permite múltiples documentos con null pero unique entre los que tienen valor
      unique: true,
    },
    birthDate: {
      type: Date,
    },
    phone: {
      type: String,
      trim: true,
    },
    idDocumentImageUrl: {
      type: String,
      default: null,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    // ✅ CAMPOS PARA EL RESETEO DE CONTRASEÑA
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    // SOLUCIÓN AL ERROR 2790: Usamos el transformador para remover la contraseña y la aserción de tipo
    toJSON: {
      transform: function (doc, ret) {
        if (ret.auth) {
          delete (ret.auth as any).password; // Usamos 'as any' para evitar el error de TS
        }
        return ret;
      },
    },
  },
);

// Middleware: hash password before save
// SOLUCIÓN AL ERROR 2349: Se eliminó el argumento 'next' ya que el hook es asíncrono
UserSchema.pre("save", async function () {
  // Hash password if modified
  if (this.isModified("auth.password")) {
    try {
      this.auth.password = await bcrypt.hash(this.auth.password, 10);
    } catch (error: any) {
      throw error;
    }
  }

  // Recalcular isProfileComplete si algún campo KYC fue modificado
  if (
    this.isModified("cedula") ||
    this.isModified("birthDate") ||
    this.isModified("phone")
  ) {
    this.isProfileComplete = !!(this.cedula && this.birthDate && this.phone);
  }
});

// Compare password for login
UserSchema.methods.comparePassword = function (candidate: string) {
  if (!this.auth || !this.auth.password) {
    // Indica al desarrollador que debe usar .select('+auth.password')
    throw new Error(
      "Password field is missing. Ensure it's explicitly selected in the query.",
    );
  }
  return bcrypt.compare(candidate, this.auth.password);
};

// Export model
export const User = model<IUser>("User", UserSchema);

// -------------------------------------------------------
// QUERIES Y ACCIONES A LA BD
// -------------------------------------------------------

// Get all users
export const getUsers = async () => {
  return User.find().lean();
};

// Get user from session (JWT → usually contains email or id)
export const getUserBySession = async (sessionUser: { email: string }) => {
  return User.findOne({ email: sessionUser.email }).lean();
};

// Create user
export const createUser = async (data: {
  fullName: string;
  email: string;
  password: string;
  role?: "passenger" | "driver" | "admin";
  credit?: number;
}) => {
  const user = new User({
    fullName: data.fullName,
    email: data.email,
    auth: {
      password: data.password, // será hasheada por el pre('save')
    },
    role: data.role ?? "passenger",
    credit: data.credit ?? 0,
  });

  return user.save();
};

// Find user by email (for login)
export const findUserByEmail = async (email: string) => {
  // Para poder comparar la contraseña, forzamos la selección del campo
  return User.findOne({ email }).select("+auth.password");
};

// Find user by ID
export const findUserById = async (id: string) => {
  return User.findById(id).lean();
};

// Completar perfil KYC Light (tarea 4.0)
// Actualiza los campos de identidad y recalcula isProfileComplete vía el pre-save hook
export const updateUserProfile = async (
  userId: string,
  data: {
    cedula?: string;
    birthDate?: Date;
    phone?: string;
    idDocumentImageUrl?: string;
  }
) => {
  // Usamos findById + save para que el pre-save hook recalcule isProfileComplete
  const user = await User.findById(userId);
  if (!user) return null;

  if (data.cedula !== undefined) user.cedula = data.cedula;
  if (data.birthDate !== undefined) user.birthDate = data.birthDate;
  if (data.phone !== undefined) user.phone = data.phone;
  if (data.idDocumentImageUrl !== undefined) user.idDocumentImageUrl = data.idDocumentImageUrl;

  return user.save();
};

// Get passengers with optional filters
export const getPassengers = async (filters: {
  email?: string;
  fullName?: string;
  creditMin?: number;
  creditMax?: number;
}) => {
  const query: any = { role: "passenger" };

  if (filters.email) {
    query.email = { $regex: filters.email, $options: "i" };
  }
  if (filters.fullName) {
    query.fullName = { $regex: filters.fullName, $options: "i" };
  }
  if (filters.creditMin !== undefined || filters.creditMax !== undefined) {
    query.credit = {};
    if (filters.creditMin !== undefined) {
      query.credit.$gte = filters.creditMin;
    }
    if (filters.creditMax !== undefined) {
      query.credit.$lte = filters.creditMax;
    }
  }

  return User.find(query).select("-auth.password").lean();
};