import { FastifyRequest, FastifyReply } from 'fastify';
import { createBusFare } from '../../models/busfare.js';
import mongoose from 'mongoose';

interface CreateBody {
  routeId: string;
  fare: number;
}

export async function createBusFareController(
  request: FastifyRequest<{ Body: CreateBody }>,
  reply: FastifyReply
) {
  const { routeId, fare } = request.body;

  if (!routeId || fare === undefined) {
    return reply.code(400).send({ message: 'routeId y fare son requeridos.' });
  }

  try {
    // Convert string to ObjectId using mongoose.Types.ObjectId
    const newFare = await createBusFare({ 
      routeId: new mongoose.Types.ObjectId(routeId) as any,
      fare 
    });
    return reply.code(201).send(newFare);
  } catch (error) {
    console.error('Error en createBusFareController:', error);
    return reply.code(500).send({ message: 'Error interno del servidor.' });
  }
}