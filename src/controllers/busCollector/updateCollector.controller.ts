import { FastifyRequest, FastifyReply } from 'fastify';
import * as Collector from '../../models/busCollector';
import { IBusCollector } from '../../models/busCollector';

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