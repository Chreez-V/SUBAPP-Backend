import { FastifyRequest, FastifyReply } from 'fastify';
import { deleteBusFare } from '../../models/busfare.js';

export async function deleteBusFareController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id?: string };

  if (!id) {
    return reply.code(400).send({ message: 'ID es requerido en la ruta.' });
  }

  try {
    const deleted = await deleteBusFare(id);
    if (!deleted) {
      return reply.code(404).send({ message: 'Tarifa no encontrada.' });
    }
    return reply.code(200).send({ message: 'Tarifa eliminada correctamente.' });
  } catch (error) {
    console.error('Error en deleteBusFareController:', error);
    return reply.code(500).send({ message: 'Error interno del servidor.' });
  }
}