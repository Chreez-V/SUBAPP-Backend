import { FastifyInstance } from 'fastify';
import { createTrip, endTrip, getTrips } from '../controllers/auth/TripController';

export default async function tripRoutes(fastify: FastifyInstance) {
  
  // 1. POST: Crear Viaje 
  fastify.post('/', {
    schema: {
      description: 'Crear un nuevo viaje',
      tags: ['Trips'],
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
  fastify.patch('/:id/end', {
    schema: {
      description: 'Finalizar un viaje activo',
      tags: ['Trips'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del Viaje' }
        }
      }
    }
  }, endTrip);

  // 3. GET: Ver Historial
  fastify.get('/', {
    schema: {
      description: 'Obtener historial de viajes',
      tags: ['Trips']
    }
  }, getTrips);
}