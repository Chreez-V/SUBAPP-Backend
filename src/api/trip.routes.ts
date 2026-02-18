import { FastifyInstance } from 'fastify';
import { createTrip, endTrip, getTrips } from '../controllers/auth/TripController.js';

export default async function tripRoutes(fastify: FastifyInstance) {
  

  // 1. POST: Crear Viaje 
  fastify.post('/', {
    schema: {
      description: 'Crear un nuevo viaje',
      tags: ['Viajes'],
      summary: 'Crear viaje',
      body: {
        type: 'object',
        required: ['driverId', 'routeIdentifier'], // Campos obligatorios
        properties: {
          driverId: { type: 'string', description: 'ID del conductor (mongoID)' },
          routeIdentifier: { type: 'string', description: 'Nombre de la ruta' },
          vehiclePlate: { type: 'string', description: 'Placa del vehículo (opcional)' }
        }
      }
    }
  }, createTrip);


  // 2. PATCH: Finalizar Viaje (Agregamos el parámetro ID)
  fastify.patch('/:id/finalizar', {
    schema: {
      description: 'Finalizar un viaje activo',
      tags: ['Viajes'],
      summary: 'Finalizar viaje',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del viaje' }
        }
      }
    }
  }, endTrip);

  // 3. GET: Ver Historial
  fastify.get('/', {
    schema: {
      description: 'Obtener historial de viajes',
      tags: ['Viajes'],
      summary: 'Historial de viajes'
    }
  }, getTrips);
}