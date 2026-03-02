import { Types } from "mongoose";
import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { createDiscountSchema, findAllDiscountsSchema, updateDiscountSchema } from "../../validators/discount.schema.js";
import { DiscountService } from "../../services/discount.service.js";

const discountService = new DiscountService()

export const createDiscount = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = request.body as z.infer<typeof createDiscountSchema>
  const { id: userId } = request.user as { id: string };

  const result = await discountService.create({ ...body, userId: new Types.ObjectId(userId) });

  if (!result.data) return reply.status(400).send({ success: false, message: result.message });

  return reply.status(201).send({
    success: true,
    message: result.message,
    data: result.data
  });
};

export const getDiscount = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id: userId } = request.user as { id: string };

  const result = await discountService.findOneByUserId(new Types.ObjectId(userId));

  if (!result.data) return reply.status(404).send({ success: false, message: result.message });

  return reply.status(200).send({
    success: true,
    message: result.message,
    data: result.data
  });
};

// admin - handlers
export const updateDiscount = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = request.body as z.infer<typeof updateDiscountSchema>
  const { id: discountId } = request.params as { id: string };
  const { id: userId } = request.user as { id: string };

  const result = await discountService.update({ ...body }, new Types.ObjectId(discountId), new Types.ObjectId(userId));

  if (!result.data) return reply.status(400).send({ success: false, message: result.message });

  return reply.status(200).send({
    success: true,
    message: result.message,
    data: result.data
  });
};

export const getDiscounts = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = request.query as z.infer<typeof findAllDiscountsSchema>;
  const result = await discountService.findAll(query);

  if (!result.data) return reply.status(404).send({ success: false, message: result.message });

  return reply.status(200).send({
    success: true,
    message: result.message,
    data: result.data
  });
};

export const deleteDiscount = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id: discountId } = request.params as { id: string };

  const result = await discountService.delete(new Types.ObjectId(discountId));

  if (!result.data) return reply.status(404).send({ success: false, message: result.message });

  return reply.status(200).send({
    success: true,
    message: result.message,
    data: result.data
  });
};