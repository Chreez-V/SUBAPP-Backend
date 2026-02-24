import { FastifyRequest, FastifyReply } from 'fastify';
import * as Collector from '../../models/busCollector';

export const handleGetAllCollectors = async (
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const collectors = await Collector.getAllCollectors();
    return reply.code(200).send(collectors);
  } catch (error: any) {
    return reply.code(500).send({ 
      message: 'ERROR: Fetching Collectors', 
      error: error.message 
    });
  }
};