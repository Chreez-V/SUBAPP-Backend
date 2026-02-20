import { FastifyRequest, FastifyReply } from 'fastify';
import * as Collector from '../../models/busCollector';

export const handleGetCollectorById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const collector = await Collector.getCollectorById(id);

    if (!collector) {
      return reply.code(404).send({ 
        message: `Collector with ID ${id} not found` 
      });
    }

    return reply.code(200).send(collector);
  } catch (error: any) {
    return reply.code(500).send({ 
      message: 'ERROR: Fetching Collector by ID', 
      error: error.message 
    });
  }
};