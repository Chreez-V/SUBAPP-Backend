import { FastifyInstance } from 'fastify'
import { registerController } from '../../controllers/auth/userRegister_controller'

/**
 * Define y registra las rutas de autenticación, específicamente la de registro.
 * @param fastify La instancia de Fastify a la que se adjuntarán las rutas.
 */

export async function register( fastify: FastifyInstance){
    fastify.post('/register', registerController)
}