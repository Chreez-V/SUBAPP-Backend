import { FastifyInstance } from 'fastify'
import { getSaldo } from '../../controllers/wallet/getSaldo.controller.js'
import { createJwtMiddleware } from '../../middlewares/authMiddleware'
import isAuth from '@/middlewares/isAuth.js'

export async function billeteraRoutes(fastify: FastifyInstance) {
  const authenticate = createJwtMiddleware(fastify)

  fastify.addHook('preHandler', isAuth) // Descomenta esto para proteger todas las rutas de este archivo
  // Endpoint: GET /api/billetera/saldo

  fastify.get('/saldo', getSaldo)
}
