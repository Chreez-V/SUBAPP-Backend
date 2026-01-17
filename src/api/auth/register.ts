import { FastifyInstance } from 'fastify'
import { registerController } from '../../controllers/auth/userRegister_controller.js'

/*
 * Define y registra las rutas de autenticación, específicamente la de registro.
 * @param fastify La instancia de Fastify a la que se adjuntarán las rutas.
 */

export async function register( fastify: FastifyInstance){
  fastify.post('/register', {
    schema: {
      description: 'Registro de usuario',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
          fullName: { type: 'string', description: 'Nombre completo del usuario' },
          email: { type: 'string', format: 'email', description: 'Correo electrónico del usuario' },
          password: { type: 'string', minLength: 6, description: 'Contraseña del usuario' },
          role: { type: 'string', enum: ['passenger', 'driver', 'admin'], description: 'Rol del usuario' },
          credit: { type: 'number', description: 'Crédito inicial del usuario' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: { type: 'string' },
            user: { type: 'object' }
          }
        },
        400: {
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        409: {
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  }, registerController)
}