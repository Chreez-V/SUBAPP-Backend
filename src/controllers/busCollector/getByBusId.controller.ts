import { FastifyRequest, FastifyReply } from 'fastify';
import * as Collector from '../../models/busCollector';

export const handleGetCollectorsByBusId = async (
  request: FastifyRequest<{ Params: { busId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { busId } = request.params;
    const collectors = await Collector.getCollectorsByBusId(busId);
    
    if (!collectors || collectors.length === 0) {
      return reply.code(404).send({ 
        message: `No collectors found for Bus ID: ${busId}` 
      });
    }

    return reply.code(200).send(collectors);
  } catch (error: any) {
    return reply.code(500).send({ 
      message: 'ERROR: Fetching Collectors by Bus ID', 
      error: error.message 
    });
  }
};