import { FastifyInstance } from 'fastify';
import { 
  createCollectorJsonSchema, 
  updateCollectorJsonSchema, 
  collectorResponseSchema, 
  collectorsListResponseSchema,
  assignBusJsonSchema 
} from '../../validators/busCollector'; 

import { handleGetCollectorsByBusId } from '../../controllers/busCollector/getByBusId.controller';
import { handleGetAllCollectors } from '../../controllers/busCollector/getCollectors.controller';
import { handleCreateCollector } from '../../controllers/busCollector/createCollector.controller';
import { handleUpdateCollector } from '../../controllers/busCollector/updateCollector.controller';
import { handleDeleteCollector } from '../../controllers/busCollector/deleteCollector.controller';
import { handleGetCollectorById } from '../../controllers/busCollector/getCollectorByID.controller';
import { getByCedulaHandler } from '../../controllers/busCollector/getCollectorByCedula.controller';
import { getByStatusHandler } from '../../controllers/busCollector/getCollectorsByStatus.controller';
import { assignBusHandler } from '../../controllers/busCollector/assignBusCollector.controller';

export async function collectorRoutes(fastify: FastifyInstance) {

  // GET colectores//obtener
  fastify.get('/obtener', {
    schema: {
      tags: ['Collector'],
      summary: 'List all collectors',
      response: {
        200: collectorsListResponseSchema
      }
    }
  }, handleGetAllCollectors);

  // GET colectores/bus/:busId
  fastify.get('/bus/:busId', {
    schema: {
      tags: ['Collector'],
      params: {
        type: 'object',
        required: ['busId'],
        properties: { busId: { type: 'string' } }
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
      tags: ['Collector'],
      summary: 'Create new collector',
      body: createCollectorJsonSchema,
      response: {
        201: collectorResponseSchema
      }
    }
  }, handleCreateCollector);

  // PUT colectores/actualizar/:id
  fastify.put('/actualizar/:id', {
    schema: {
      tags: ['Collector'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' } }
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
      tags: ['Collector'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' } }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } }
      }
    }
  }, handleDeleteCollector);

  // GET colectores/obtener/:id
  fastify.get('/obtener/:id', {
    schema: {
      tags: ['Collector'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' } }
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
      tags: ['Collector'],
      params: {
        type: 'object',
        required: ['cedula'],
        properties: { cedula: { type: 'string' } }
      },
      response: {
        200: collectorResponseSchema
      }
    }
  }, getByCedulaHandler);

  // GET colectores/obtener-estado/:status
  fastify.get('/obtener-estado/:status', {
    schema: {
      tags: ['Collector'],
      params: {
        type: 'object',
        required: ['status'],
        properties: { 
          status: { type: 'string', enum: ['active', 'inactive'] } 
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
      tags: ['Collector'],
      summary: 'Assign a bus to a collector',
      params: {
        type: 'object',
        required: ['cedula'],
        properties: { id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' } }
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