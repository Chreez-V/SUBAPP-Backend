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
  fastify.get('/supports', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      description: 'Get all support agents',
      tags: ['Support'],
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

  fastify.get('/supports/active', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      description: 'Get active support agents',
      tags: ['Support'],
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

  fastify.get('/supports/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      description: 'Get support agent by ID',
      tags: ['Support'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
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
  fastify.post('/supports', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      description: 'Create new support agent',
      tags: ['Support'],
        body: {
          type: 'object',
          required: ['fullName', 'email', 'password'],
          properties: {
            fullName: { type: 'string', minLength: 2 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            phone: { type: 'string' }
          },
          additionalProperties: false // No permite campos extra como "image.png"
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

  fastify.patch('/supports/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      description: 'Update support agent',
      tags: ['Support'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          fullName: { type: 'string', minLength: 2 },
          status: { enum: ['Active', 'Inactive'] },
          phone: { type: 'string' }
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

  fastify.delete('/supports/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      description: 'Deactivate support agent',
      tags: ['Support'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
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

  fastify.delete('/supports/:id/permanent', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      description: 'Permanently delete support agent',
      tags: ['Support'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
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