import { FastifyRequest, FastifyReply } from 'fastify';
import { getBusFares } from '../../models/busfare.js';

export async function getBusFaresController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Permitir filtros por query string (por ejemplo ?routeId=...)
    const filter = (request.query as Record<string, any>) || {};
    const fares = await getBusFares(filter);
    return reply.code(200).send(fares);
  } catch (error) {
    console.error('Error en getBusFaresController:', error);
    return reply.code(500).send({ message: 'Error interno del servidor.' });
  }
}