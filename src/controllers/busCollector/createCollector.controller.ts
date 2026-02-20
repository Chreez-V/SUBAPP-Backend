import { FastifyRequest, FastifyReply } from 'fastify';
import * as Collector from '../../models/busCollector';
import { IBusCollector } from '../../models/busCollector';

export const handleCreateCollector = async (
  request: FastifyRequest<{ Body: Partial<IBusCollector> }>,
  reply: FastifyReply
) => {
  try {
    const collector = await Collector.createCollector(request.body);
    return reply.code(201).send(collector);
  } catch (error: any) {
    return reply.code(400).send({ 
      message: 'ERROR: Creating Bus Collector', 
      error: error.message 
    });
  }
};