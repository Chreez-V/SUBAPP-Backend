import { FastifyInstance } from 'fastify'
import { getSaldo } from '../../controllers/wallet/getSaldo.controller.js'
import { recargarSaldo } from '../../controllers/wallet/recargarSaldo.controller.js'
import { createJwtMiddleware } from '../../middlewares/authMiddleware.js'
import { getPaymentValidationsController } from '../../controllers/wallet/getValidations.controller.js'
import { getPaymentValidationController } from '../../controllers/wallet/getValidation.controller.js'
import { approveRechargeController } from '../../controllers/wallet/approveRecharge.controller.js'
import { rejectRechargeController } from '../../controllers/wallet/rejectRecharge.controller.js'
import { rejectPaymentSchema } from '../../validators/wallet.schema.js'

export async function walletRoutes(fastify: FastifyInstance) {
  // 1. Creamos el middleware
  const authenticate = createJwtMiddleware(fastify)

  // 2. Usamos 'authenticate' como preHandler para proteger las rutas de billetera
  fastify.addHook('preHandler', authenticate)

  // Endpoint: GET /api/wallet/saldo
  fastify.get('/saldo', getSaldo)

  // Endpoint: GET /api/wallet/recargar (para que los pasajeros puedan recargar saldo, pero no los conductores)
  fastify.post('/recargar', recargarSaldo)

  fastify.get('/validaciones', getPaymentValidationsController)
  fastify.get('/validaciones/:id', getPaymentValidationController)
  fastify.put('/validaciones/:id/aprobar', approveRechargeController)
  fastify.put(
    '/validaciones/:id/rechazar',
    { schema: rejectPaymentSchema },
    rejectRechargeController,
  )
}
