import { FastifyRequest, FastifyReply } from 'fastify';
import * as Collector from '../../models/busCollector';

export const handleDeleteCollector = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const deleted = await Collector.deleteCollector(id);

    if (!deleted) {
      return reply.code(404).send({ message: 'Collector not found' });
    }

    return reply.code(200).send({ message: 'Collector deleted successfully' });
  } catch (error: any) {
    return reply.code(500).send({ 
      message: 'ERROR: Deleting Collector', 
      error: error.message 
    });
  }
};