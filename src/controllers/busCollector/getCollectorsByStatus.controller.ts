import { FastifyRequest, FastifyReply } from 'fastify';
import * as Collector from '../../models/busCollector.js';
import { IBusCollector } from '../../models/busCollector.js';

interface IStatusParam {
  status: 'active' | 'inactive';
}

export const getByStatusHandler = async (
  request: FastifyRequest<{ Params: IStatusParam }>, 
  reply: FastifyReply
) => {
  try {
    const { status } = request.params;

    if (!status || !['active', 'inactive'].includes(status)) {
      return reply.code(400).send({ message: "Estatus inválido. Debe ser 'active' o 'inactive'." });
    }

    const collectors = await Collector.getCollectorsByStatus(status);

    return reply.send({
      count: collectors.length,
      data: collectors
    });
  } catch (error) {
    return reply.code(500).send({ message: "Error al filtrar colectores" });
  }
};