import { FastifyRequest, FastifyReply } from 'fastify';
import * as Collector from '../../models/busCollector.js';
import { IBusCollector } from '../../models/busCollector.js';

export const handleUpdateCollector = async (
  request: FastifyRequest<{ Params: { id: string }; Body: Partial<IBusCollector> }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const updatedCollector = await Collector.updateCollector(id, request.body);

    if (!updatedCollector) {
      return reply.code(404).send({ message: 'Collector not found' });
    }

    return reply.code(200).send(updatedCollector);
  } catch (error: any) {
    return reply.code(400).send({ 
      message: 'ERROR: Updating Collector', 
      error: error.message 
    });
  }
};