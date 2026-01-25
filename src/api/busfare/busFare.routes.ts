import { FastifyInstance } from 'fastify';
import { getBusFaresController } from '../../controllers/busfare/getBusFares.controller.js';
import { createBusFareController } from '../../controllers/busfare/createBusFares.controller.js';
import { updateBusFareController } from '../../controllers/busfare/updateBusFares.controller.js';
import { deleteBusFareController } from '../../controllers/busfare/deleteBusFares.controller.js';

export async function busFareRoutes(fastify: FastifyInstance) {
  // GET /busfares
  fastify.get('/', {
    schema: {
      tags: ['Bus Fare'],
      summary: 'Obtener todas las tarifas de bus',
      description: 'Retorna la lista completa de tarifas configuradas'
    }
  }, getBusFaresController);

  // POST /busfares
  fastify.post('/', {
    schema: {
      tags: ['Bus Fare'],
      summary: 'Crear nueva tarifa de bus',
      description: 'Crea una nueva tarifa con el monto especificado'
    }
  }, createBusFareController);

  // PUT /busfares/:id
  fastify.put('/:id', {
    schema: {
      tags: ['Bus Fare'],
      summary: 'Actualizar tarifa de bus',
      description: 'Actualiza el monto de una tarifa existente',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID de la tarifa' }
        }
      }
    }
  }, updateBusFareController);

  // DELETE /busfares/:id
  fastify.delete('/:id', {
    schema: {
      tags: ['Bus Fare'],
      summary: 'Eliminar tarifa de bus',
      description: 'Elimina una tarifa específica por su ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID de la tarifa' }
        }
      }
    }
  }, deleteBusFareController);
}