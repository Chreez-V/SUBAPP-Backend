import { FastifyInstance } from 'fastify'
import { 
  getAllSupports, 
  getActiveSupports, 
  getSupportByIdController, 
  createSupportController, 
  updateSupportController, 
  deleteSupportController, 
  permanentDeleteSupportController 
} from '../../controllers/support.controller.js'
import { createJwtMiddleware } from '../../middlewares/authMiddleware.js'
import { requireAdmin } from '../../middlewares/requireAdmin.js'

export default async function supportRoutes(fastify: FastifyInstance) {
  const authenticate = createJwtMiddleware(fastify);
  
  // Protected routes - require authentication
  fastify.get('/agentes-soporte', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      description: 'Retorna la lista completa de todos los agentes de soporte registrados en el sistema. Requiere autenticación con rol de administrador.',
      summary: 'Listar todos los agentes de soporte',
      tags: ['Soporte'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            count: { type: 'number' },
            data: {
              type: 'array',
              items: { type: 'object' }
            }
          }
        }
      }
    }
  }, getAllSupports)

  fastify.get('/agentes-soporte/activos', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      description: 'Retorna únicamente los agentes de soporte con estado activo disponibles para atender consultas.',
      summary: 'Listar agentes de soporte activos',
      tags: ['Soporte'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            count: { type: 'number' },
            data: {
              type: 'array',
              items: { type: 'object' }
            }
          }
        }
      }
    }
  }, getActiveSupports)

  fastify.get('/agentes-soporte/buscar/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      description: 'Retorna los datos completos de un agente de soporte específico buscado por su ID de MongoDB.',
      summary: 'Obtener agente de soporte por ID',
      tags: ['Soporte'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del agente de soporte (MongoDB ObjectId)' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, getSupportByIdController)

  // Protected routes - require authentication
  fastify.post('/agentes-soporte/crear', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      description: 'Crea un nuevo agente de soporte en el sistema con sus datos personales y credenciales de acceso. Requiere rol de administrador.',
      summary: 'Crear agente de soporte',
      tags: ['Soporte'],
        body: {
          type: 'object',
          required: ['fullName', 'email', 'password'],
          properties: {
            fullName: { type: 'string', minLength: 2, description: 'Nombre completo del agente' },
            email: { type: 'string', format: 'email', description: 'Correo electrónico del agente' },
            password: { type: 'string', minLength: 6, description: 'Contraseña (mínimo 6 caracteres)' },
            phone: { type: 'string', description: 'Teléfono del agente (opcional)' }
          },
          additionalProperties: false
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  fullName: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                  status: { type: 'string' },
                  phone: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' }
                }
              }
            }
          }
        }
    }
  }, createSupportController)

  fastify.patch('/agentes-soporte/actualizar/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      description: 'Actualiza los datos de un agente de soporte existente. Solo se modifican los campos enviados en el cuerpo de la petición.',
      summary: 'Actualizar agente de soporte',
      tags: ['Soporte'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del agente de soporte (MongoDB ObjectId)' }
        }
      },
      body: {
        type: 'object',
        properties: {
          fullName: { type: 'string', minLength: 2, description: 'Nuevo nombre del agente' },
          status: { enum: ['Active', 'Inactive'], description: 'Nuevo estado del agente' },
          phone: { type: 'string', description: 'Nuevo teléfono del agente' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, updateSupportController)

  fastify.delete('/agentes-soporte/desactivar/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      description: 'Desactiva un agente de soporte marcándolo como inactivo (eliminación lógica). El agente sigue en la base de datos.',
      summary: 'Desactivar agente de soporte',
      tags: ['Soporte'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del agente de soporte (MongoDB ObjectId)' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, deleteSupportController)

  fastify.delete('/agentes-soporte/eliminar/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      description: 'Elimina permanentemente un agente de soporte del sistema. Esta acción no puede deshacerse.',
      summary: 'Eliminar agente de soporte permanentemente',
      tags: ['Soporte'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID del agente de soporte (MongoDB ObjectId)' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, permanentDeleteSupportController)
}