import { FastifyInstance } from 'fastify';
import { 
  createCollectorJsonSchema, 
  updateCollectorJsonSchema, 
  collectorResponseSchema, 
  collectorsListResponseSchema,
  assignBusJsonSchema 
} from '../../validators/busCollector.js'; 

import { handleGetCollectorsByBusId } from '../../controllers/busCollector/getByBusId.controller.js';
import { handleGetAllCollectors } from '../../controllers/busCollector/getCollectors.controller.js';
import { handleCreateCollector } from '../../controllers/busCollector/createCollector.controller.js';
import { handleUpdateCollector } from '../../controllers/busCollector/updateCollector.controller.js';
import { handleDeleteCollector } from '../../controllers/busCollector/deleteCollector.controller.js';
import { handleGetCollectorById } from '../../controllers/busCollector/getCollectorByID.controller.js';
import { getByCedulaHandler } from '../../controllers/busCollector/getCollectorByCedula.controller.js';
import { getByStatusHandler } from '../../controllers/busCollector/getCollectorsByStatus.controller.js';
import { assignBusHandler } from '../../controllers/busCollector/assignBusCollector.controller.js';

export async function collectorRoutes(fastify: FastifyInstance) {

  // GET colectores/obtener
  fastify.get('/obtener', {
    schema: {
      tags: ['Colectores'],
      summary: 'Listar todos los colectores',
      description: 'Retorna la lista completa de colectores registrados en el sistema.',
      security: [{ bearerAuth: [] }],
      response: {
        200: collectorsListResponseSchema
      }
    }
  }, handleGetAllCollectors);

  // GET colectores/bus/:busId
  fastify.get('/bus/:busId', {
    schema: {
      tags: ['Colectores'],
      summary: 'Obtener colectores por autobús',
      description: 'Retorna los colectores asignados a un autobús específico.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['busId'],
        properties: { busId: { type: 'string', description: 'ID del autobús' } }
      },
      response: {
        200: collectorsListResponseSchema,
        404: { type: 'object', properties: { message: { type: 'string' } } }
      }
    }
  }, handleGetCollectorsByBusId);

  // POST colectores/crear
  fastify.post('/crear', {
    schema: {
      tags: ['Colectores'],
      summary: 'Crear nuevo colector',
      description: 'Registra un nuevo colector en el sistema con sus datos personales.',
      security: [{ bearerAuth: [] }],
      body: createCollectorJsonSchema,
      response: {
        201: collectorResponseSchema
      }
    }
  }, handleCreateCollector);

  // PUT colectores/actualizar/:id
  fastify.put('/actualizar/:id', {
    schema: {
      tags: ['Colectores'],
      summary: 'Actualizar colector',
      description: 'Actualiza los datos de un colector existente por su ID.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'ID del colector (ObjectId)' } }
      },
      body: updateCollectorJsonSchema,
      response: {
        200: collectorResponseSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, handleUpdateCollector);

  // DELETE colectores/eliminar/:id
  fastify.delete('/eliminar/:id', {
    schema: {
      tags: ['Colectores'],
      summary: 'Eliminar colector',
      description: 'Elimina permanentemente un colector del sistema por su ID.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'ID del colector (ObjectId)' } }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } }
      }
    }
  }, handleDeleteCollector);

  // GET colectores/obtener/:id
  fastify.get('/obtener/:id', {
    schema: {
      tags: ['Colectores'],
      summary: 'Obtener colector por ID',
      description: 'Retorna los datos completos de un colector específico.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'ID del colector (ObjectId)' } }
      },
      response: {
        200: collectorResponseSchema,
        404: { type: 'object', properties: { message: { type: 'string' } } }
      }
    }
  }, handleGetCollectorById);

  // GET colectores/obtener-cedula/:cedula
  fastify.get('/obtener-cedula/:cedula', {
    schema: {
      tags: ['Colectores'],
      summary: 'Buscar colector por cédula',
      description: 'Busca y retorna un colector utilizando su número de cédula.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['cedula'],
        properties: { cedula: { type: 'string', description: 'Número de cédula del colector' } }
      },
      response: {
        200: collectorResponseSchema
      }
    }
  }, getByCedulaHandler);

  // GET colectores/obtener-estado/:status
  fastify.get('/obtener-estado/:status', {
    schema: {
      tags: ['Colectores'],
      summary: 'Listar colectores por estado',
      description: 'Retorna los colectores filtrados por su estado (activo o inactivo).',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['status'],
        properties: { 
          status: { type: 'string', enum: ['active', 'inactive'], description: 'Estado del colector' } 
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            count: { type: 'number' },
            data: collectorsListResponseSchema
          }
        }
      }
    }
  }, getByStatusHandler);

  // PUT colectores/actualizar/:cedula/asignar-bus
  fastify.put('/actualizar/:cedula/asignar-bus', {
    schema: {
      tags: ['Colectores'],
      summary: 'Asignar autobús a colector',
      description: 'Asigna un autobús a un colector específico utilizando su cédula.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['cedula'],
        properties: { cedula: { type: 'string', description: 'Cédula del colector' } }
      },
      body: assignBusJsonSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            data: collectorResponseSchema
          }
        }
      }
    }
  }, assignBusHandler);
}