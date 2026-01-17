import { FastifyInstance } from 'fastify';
import { getBusFaresController } from '../../controllers/busfare/getBusFares.controller.js';
import { createBusFareController } from '../../controllers/busfare/createBusFares.controller.js';
import { updateBusFareController } from '../../controllers/busfare/updateBusFares.controller.js';
import { deleteBusFareController } from '../../controllers/busfare/deleteBusFares.controller.js';

export async function busFareRoutes(fastify: FastifyInstance) {
  // Prefijo será definido al registrar este plugin (ej: /busfares)
  fastify.get('/', getBusFaresController);
  fastify.post('/', createBusFareController);
  fastify.put('/:id', updateBusFareController);
  fastify.delete('/:id', deleteBusFareController);
}