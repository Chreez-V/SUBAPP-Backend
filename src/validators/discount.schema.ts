import { z } from "zod";
import { DiscountType, DocumentType } from "@/models/discount-profile.model";
import { status } from "elysia";

export const createDiscountSchema = z.object({
  documentType: z.enum(Object.values(DocumentType)),
  discountType: z.enum(Object.values(DiscountType)),
  institutionName: z.string().trim().min(1).max(255).optional(),
  documentNumber: z.string().trim().optional(),
  documentImageUrl: z.url().optional(),
});

export const updateDiscountSchema = z.object({
  documentType: z.enum(Object.values(DocumentType)).optional(),
  discountType: z.enum(Object.values(DiscountType)).optional(),
  status: z.enum(Object.values(status)).optional(),
  rejectionReason: z.string().trim().optional(),
  institutionName: z.string().trim().min(1).max(255).optional(),
  documentNumber: z.string().trim().optional(),
  documentImageUrl: z.url().optional(),
  validFrom: z.date().optional(),
  validUntil: z.date().optional(),
});

export const findAllDiscountsSchema = z.object({
  pageNumber: z.number().optional(),
  pageSize: z.number().optional(),
  status: z.enum(Object.values(status)).optional(),
  discountType: z.enum(Object.values(DiscountType)).optional(),
  documentType: z.enum(Object.values(DocumentType)).optional(),
})