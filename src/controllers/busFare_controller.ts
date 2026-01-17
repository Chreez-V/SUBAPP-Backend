import { type FastifyRequest, type FastifyReply } from "fastify";
import { getGlobalFare, updateGlobalFare } from '../models/busFare_model.js';

export async function getFareController(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const fare = await getGlobalFare();
    if (!fare) {
      return reply.status(200).send({ farePrice: 0, currency: 'Bs', message: "Tarifa no inicializada" });
    }
    return reply.status(200).send(fare);
  } catch (error) {
    return reply.status(500).send({ message: 'Error al obtener la tarifa.' });
  }
}

export async function updateFareController(request: FastifyRequest<{ Body: { farePrice: number } }>, reply: FastifyReply) {
  try {
    const { farePrice } = request.body;
    const updated = await updateGlobalFare(farePrice);
    return reply.status(200).send({
      message: 'Tarifa actualizada exitosamente en Bs',
      data: updated
    });
  } catch (error) {
    return reply.status(500).send({ message: 'Error al actualizar la tarifa.' });
  }
}