import { FastifyRequest, FastifyReply } from 'fastify';
import * as Collector from '../../models/busCollector';
import { IBusCollector } from '../../models/busCollector';

export const getByCedulaHandler = async (
  request: FastifyRequest<{ Params: IBusCollector }>, 
  reply: FastifyReply
) => {
  try {
    const { cedula } = request.params;

    const collector = await Collector.getCollectorByCedula(cedula);

    if (!collector) {
      return reply.code(404).send({ 
        statusCode: 404, 
        message: `Colector con cédula ${cedula} no encontrado.` 
      });
    }

    return reply.code(200).send(collector);
  } catch (error) {
    request.log.error(error); // Uso del logger nativo de Fastify
    return reply.code(500).send({ message: "Error interno al buscar por cédula" });
  }
};