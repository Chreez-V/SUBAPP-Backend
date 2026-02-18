import { FastifyRequest, FastifyReply } from 'fastify';
import { createBusFare } from '../../models/busfare.js';
import mongoose from 'mongoose';

interface CreateBody {
  routeId?: string;
  fare: number;
}

export async function createBusFareController(
  request: FastifyRequest<{ Body: CreateBody }>,
  reply: FastifyReply
) {
  const { routeId, fare } = request.body;

  if (fare === undefined) {
    return reply.code(400).send({ message: 'fare es requerido.' });
  }

  try {
    const data: any = { fare };

    // Only set routeId if it's a valid ObjectId
    if (routeId && mongoose.Types.ObjectId.isValid(routeId)) {
      data.routeId = new mongoose.Types.ObjectId(routeId);
    }

    const newFare = await createBusFare(data);
    return reply.code(201).send(newFare);
  } catch (error) {
    console.error('Error en createBusFareController:', error);
    return reply.code(500).send({ message: 'Error interno del servidor.' });
  }
}