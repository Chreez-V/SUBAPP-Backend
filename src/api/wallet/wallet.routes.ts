import { FastifyInstance } from 'fastify'
import { getSaldo } from '../../controllers/wallet/getSaldo.controller.js'
import { withdraw } from '../../controllers/wallet/withdraw.controller.js'
import { createJwtMiddleware } from '../../middlewares/authMiddleware.js'

export async function walletRoutes(fastify: FastifyInstance) {
  // 1. Creamos el middleware
  const authenticate = createJwtMiddleware(fastify)

  // 2. Usamos 'authenticate' como preHandler para proteger las rutas de billetera
  fastify.addHook('preHandler', authenticate)

  // Endpoint: GET /api/wallet/saldo
  fastify.get('/saldo', getSaldo)
  // Endpoint: POST /api/billetera/retirar 
  fastify.post('/retirar', withdraw)
}
