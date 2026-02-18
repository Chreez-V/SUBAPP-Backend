import { FastifyInstance } from 'fastify';
import {
  getAllReports,
  getPendingReports,
  getReportById,
  createReport,
  resolveReport,
  deleteReport,
  getReportReasons,
} from '../controllers/reports.controller.js';

export async function reportsRoutes(fastify: FastifyInstance) {
  // GET - List of valid report reasons (enum)
  fastify.get('/reportes/motivos', {
    schema: {
      description: 'Retorna la lista de motivos válidos para un reporte. Útil para popular un dropdown en la app móvil o admin panel.',
      summary: 'Listar motivos de reporte',
      tags: ['Reportes'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  value: { type: 'string' },
                  label: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, getReportReasons);

  // GET - List all reports
  fastify.get('/reportes', {
    schema: {
      description: 'Retorna todos los reportes del sistema, con datos de la ruta y del conductor poblados.',
      summary: 'Listar todos los reportes',
      tags: ['Reportes'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            count: { type: 'number' },
            data: { type: 'array' },
          },
        },
      },
    },
  }, getAllReports);

  // GET - List pending reports only
  fastify.get('/reportes/pendientes', {
    schema: {
      description: 'Retorna únicamente los reportes con estado pendiente que el administrador aún no ha resuelto.',
      summary: 'Listar reportes pendientes',
      tags: ['Reportes'],
    },
  }, getPendingReports);

  // GET - Get report by ID
  fastify.get('/reportes/buscar/:id', {
    schema: {
      description: 'Retorna un reporte específico con todos sus datos poblados.',
      summary: 'Obtener reporte por ID',
      tags: ['Reportes'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del reporte (MongoDB ObjectId)' },
        },
      },
    },
  }, getReportById);

  // POST - Create a new report (driver submits)
  fastify.post('/reportes/crear', {
    schema: {
      description: 'Crea un nuevo reporte de ruta intransitable. Generalmente lo envía un conductor desde la app móvil cuando detecta un problema en su ruta asignada.',
      summary: 'Crear reporte de ruta',
      tags: ['Reportes'],
      body: {
        type: 'object',
        required: ['routeId', 'driverId', 'reason'],
        properties: {
          routeId: { type: 'string', description: 'ID de la ruta reportada' },
          driverId: { type: 'string', description: 'ID del conductor que reporta' },
          reason: {
            type: 'string',
            description: 'Motivo del reporte (usar /reportes/motivos para ver opciones)',
            enum: [
              'via_deteriorada', 'inundacion', 'derrumbe', 'accidente_vial',
              'obra_en_construccion', 'cierre_policial', 'arbol_caido',
              'falla_semaforo', 'protesta', 'otro',
            ],
          },
          customReason: { type: 'string', description: 'Motivo personalizado (requerido si reason es "otro")' },
          notes: { type: 'string', description: 'Notas adicionales del conductor' },
        },
      },
    },
  }, createReport);

  // PATCH - Resolve a report (admin action)
  fastify.patch('/reportes/resolver/:id', {
    schema: {
      description: 'El administrador resuelve un reporte pendiente. Si se aprueba, la ruta reportada se desactiva automáticamente. Opcionalmente puede activar una ruta alternativa del mismo conjunto.',
      summary: 'Resolver reporte',
      tags: ['Reportes'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del reporte' },
        },
      },
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['approved', 'rejected', 'resolved'],
            description: 'approved = desactivar ruta e intercambiar, rejected = rechazar reporte, resolved = marcar como resuelto',
          },
          switchToRouteId: { type: 'string', description: 'ID de la ruta alternativa a activar (opcional, solo para approved)' },
          resolutionNotes: { type: 'string', description: 'Comentario del administrador' },
        },
      },
    },
  }, resolveReport);

  // DELETE - Permanently delete a report
  fastify.delete('/reportes/eliminar/:id', {
    schema: {
      description: 'Elimina permanentemente un reporte del sistema.',
      summary: 'Eliminar reporte',
      tags: ['Reportes'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del reporte' },
        },
      },
    },
  }, deleteReport);
}
