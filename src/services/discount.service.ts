import { DiscountProfile, DiscountType, IDiscountProfile, DocumentType, DiscountStatus } from "@/models/discount-profile.model";
import type { createDiscountSchema, findAllDiscountsSchema, updateDiscountSchema } from "@/validators/discount.schema";
import { Types } from "mongoose";
import { z } from "zod";

interface createDiscountParams extends z.infer<typeof createDiscountSchema> {
  userId: Types.ObjectId;
}

interface findAllDiscountsParams extends z.infer<typeof findAllDiscountsSchema> {
}

interface updateDiscountParams extends z.infer<typeof updateDiscountSchema> {
}

interface responseService {
  data?: IDiscountProfile | null;
  message?: string;
}

export class DiscountService {
  private readonly DISCOUNT_VALIDATIONS: Record<DiscountType, (data: any) => string | null> = {
    [DiscountType.ACADEMIC]: (data) => {
      const hasDocs = data.documentType.includes(DocumentType.STUDENT_CARD) ||
        data.documentType.includes(DocumentType.ENROLLMENT_CERTIFICATE);

      if (!hasDocs) return "Para el descuento académico, se requiere Carnet Estudiantil o Certificado de Matrícula.";

      if (!data.institutionName) return "Debes indicar el nombre de la institución educativa.";
      return null;
    },
    [DiscountType.DISABILITY]: (data) => {
      if (!data.documentType.includes(DocumentType.SENIOR_ID)) {
        return "El documento de identidad oficial es obligatorio para este trámite.";
      }
      return null;
    },
  }

  async create(data: createDiscountParams): Promise<responseService> {
    const validator = this.DISCOUNT_VALIDATIONS[data.discountType as DiscountType];
  
    if (!validator) return { message: "Tipo de descuento no soportado.", data: null };
  
    const errorMessage = validator(data);
    if (errorMessage) return { message: errorMessage, data: null };
  
    const existingActive = await DiscountProfile.findOne({ 
      userId: data.userId, 
      status: { $in: [DiscountStatus.PENDING, DiscountStatus.APPROVED] } 
    });
  
    if (existingActive) {
      return { 
        message: `Ya tienes una solicitud ${existingActive.status}.`, 
        data: null 
      };
    }
    
    const discount = await DiscountProfile.create({
      ...data,
      userId: data.userId,
      status: DiscountStatus.PENDING,
    });
  
    return { data: discount, message: "Solicitud enviada correctamente." };
  }

  async findOneByUserId(userId: Types.ObjectId) {
    const discount = await DiscountProfile.findOne({ userId });

    if (!discount) return { data: null, message: "No se encontró ninguna solicitud." };

    return { data: discount, message: "Solicitud encontrada con éxito." };
  }

  async findAll(params: findAllDiscountsParams) {
    const { pageNumber = 1, pageSize = 10, status, discountType, documentType } = params;

    const query: any = {};

    if (status) query.status = status;
    if (discountType) query.discountType = discountType;
    if (documentType) query.documentType = documentType;

    const discounts = await DiscountProfile.find(query)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    if (!discounts || discounts.length === 0) return { data: null, message: "No se encontraron solicitudes." };

    return { data: discounts, message: "Solicitudes encontradas con éxito." };
  }

  async update(params: updateDiscountParams, discountId: Types.ObjectId, userId: Types.ObjectId) {
    const currentDiscount = await DiscountProfile.findById(discountId);
	
    if (!currentDiscount) return { data: null, message: "Solicitud no encontrada." };
		
    const updateData: Partial<IDiscountProfile> = {
      ...params,
      reviewedBy: userId,
      reviewedAt: new Date(),
    };
			
    if (params.status === DiscountStatus.REJECTED) {
      if (!params.rejectionReason) return { message: "Debes indicar el motivo del rechazo.", data: null };
        
      const rejected = await DiscountProfile.findByIdAndUpdate(discountId, updateData, { new: true });
      return { data: rejected, message: "Solicitud rechazada." };
    }
    
    if (params.status !== DiscountStatus.APPROVED) {
      const updated = await DiscountProfile.findByIdAndUpdate(discountId, updateData, { new: true });
      return { data: updated, message: "Solicitud actualizada." };
    }
        
    updateData.validFrom = new Date();
        
    if (currentDiscount.discountType === DiscountType.ACADEMIC) {
      const expireDate = new Date();
      expireDate.setMonth(expireDate.getMonth() + 6);
      updateData.validUntil = expireDate;
    }

    const discount = await DiscountProfile.findByIdAndUpdate(discountId, updateData, { new: true });

    return { data: discount, message: "Solicitud procesada con éxito." };
  }

  async delete(discountId: Types.ObjectId) {
    const discount = await DiscountProfile.findOneAndDelete({ _id: discountId });

    if (!discount) return { data: null, message: "No se encontró ninguna solicitud." };

    return { data: discount, message: "Solicitud eliminada con éxito." };
  }
}
