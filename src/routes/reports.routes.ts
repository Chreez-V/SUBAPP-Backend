import { FastifyInstance } from 'fastify';
import {
  getAllReports,
  getPendingReports,
  getReportById,
  createReport,
  resolveReport,
  deleteReport,
  getReportReasons,
  getMovimientoTotalReport,
  getTransaccionesReport,
  getCuotaDiariaReport,
  getCobrosPorConductor,
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

  // GET - Total movement report by period
  fastify.get('/reportes/movimiento-total', {
    schema: {
      description: 'Retorna el resumen de ingresos y egresos por tipo de transaccion en un periodo.',
      summary: 'Resumen de movimiento total',
      tags: ['Reportes'],
      querystring: {
        type: 'object',
        required: ['desde', 'hasta'],
        properties: {
          desde: { type: 'string', description: 'Fecha inicio (YYYY-MM-DD)' },
          hasta: { type: 'string', description: 'Fecha fin (YYYY-MM-DD)' },
        },
      },
    },
  }, getMovimientoTotalReport);

  // GET - List transactions with filters
  fastify.get('/reportes/transacciones', {
    schema: {
      description: 'Lista todas las transacciones con filtros opcionales.',
      summary: 'Listar transacciones con filtros',
      tags: ['Reportes'],
      querystring: {
        type: 'object',
        properties: {
          desde: { type: 'string', description: 'Fecha inicio (YYYY-MM-DD)' },
          hasta: { type: 'string', description: 'Fecha fin (YYYY-MM-DD)' },
          type: { type: 'string', description: 'Tipo de transaccion' },
          userId: { type: 'string', description: 'ID del usuario' },
          routeId: { type: 'string', description: 'ID de la ruta' },
          driverId: { type: 'string', description: 'ID del conductor' },
          tripId: { type: 'string', description: 'ID del viaje' },
          fareType: { type: 'string', description: 'Tipo de tarifa' },
          minAmount: { type: 'string', description: 'Monto minimo' },
          maxAmount: { type: 'string', description: 'Monto maximo' },
          cardUid: { type: 'string', description: 'UID de tarjeta' },
          description: { type: 'string', description: 'Busqueda por descripcion (parcial)' },
          page: { type: 'string', description: 'Pagina (default 1)' },
          limit: { type: 'string', description: 'Limite por pagina (default 50, max 200)' },
          sortBy: { type: 'string', enum: ['createdAt', 'amount', 'type'] },
          sortDir: { type: 'string', enum: ['asc', 'desc'] },
        },
      },
    },
  }, getTransaccionesReport);

  // GET - Daily top-up target
  fastify.get('/reportes/cuota-diaria', {
    schema: {
      description: 'Retorna el avance de la cuota diaria de recargas.',
      summary: 'Reporte de cuota diaria',
      tags: ['Reportes'],
      querystring: {
        type: 'object',
        required: ['cuota'],
        properties: {
          cuota: { type: 'string', description: 'Cuota diaria establecida' },
        },
      },
    },
  }, getCuotaDiariaReport);

  // GET - Accumulated charges by driver
  fastify.get('/reportes/porconductor/:driverId', {
    schema: {
      description: 'Retorna los cobros acumulados por conductor para pagos NFC y QR.',
      summary: 'Cobros acumulados por conductor',
      tags: ['Reportes'],
      querystring: {
        type: 'object',
        properties: {
          desde: { type: 'string', description: 'Fecha inicio (YYYY-MM-DD)' },
          hasta: { type: 'string', description: 'Fecha fin (YYYY-MM-DD)' },
        },
      },
      params: {
        type: 'object',
        properties: {
          driverId: { type: 'string', description: 'ID del conductor' },
        },
        required: ['driverId'],
      },
    },
  }, getCobrosPorConductor);

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
