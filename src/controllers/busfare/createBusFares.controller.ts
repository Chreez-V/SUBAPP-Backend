import { FastifyRequest, FastifyReply } from 'fastify';
import { createBusFare } from '../../models/busfare.js';

interface CreateBody {
  amount: number;
}

export async function createBusFareController(
  request: FastifyRequest<{ Body: CreateBody }>,
  reply: FastifyReply
) {
  const { amount } = request.body;

  if (amount === undefined) {
    return reply.code(400).send({ message: 'amount es requerido.' });
  }

  try {
    const newFare = await createBusFare({ amount });
    return reply.code(201).send(newFare);
  } catch (error) {
    console.error('Error en createBusFareController:', error);
    return reply.code(500).send({ message: 'Error interno del servidor.' });
  }
}