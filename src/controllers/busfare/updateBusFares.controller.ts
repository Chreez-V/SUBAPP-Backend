import { FastifyRequest, FastifyReply } from 'fastify';
import { updateBusFare } from '../../models/busfare.js';

export async function updateBusFareController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id?: string };
  const data = request.body as Record<string, any>;

  if (!id) {
    return reply.code(400).send({ message: 'ID es requerido en la ruta.' });
  }

  try {
    const updated = await updateBusFare(id, data);
    if (!updated) {
      return reply.code(404).send({ message: 'Tarifa no encontrada.' });
    }
    return reply.code(200).send(updated);
  } catch (error) {
    console.error('Error en updateBusFareController:', error);
    return reply.code(500).send({ message: 'Error interno del servidor.' });
  }
}