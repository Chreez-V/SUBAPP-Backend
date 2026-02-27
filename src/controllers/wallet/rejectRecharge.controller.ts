import { FastifyRequest, FastifyReply } from 'fastify'
import { PaymentValidation } from '../../models/paymentValidation.js'

interface PaymentParams {
  id: string
}

interface RejectBody {
  rejectionReason: string
}

/**
 * Rechaza una recarga de saldo previamente validada
 *
 * Se necesita proporcionar el id de la recarga y el motivo de rechazo
 *
 * Solo los administradores pueden rechazar recargas
 *
 * @param {FastifyRequest<{ Params: PaymentParams; Body: RejectBody >} request
 * @param {FastifyReply} reply
 * @returns {Promise<FastifyReply>} respuesta con el estado de la operacion y el nuevo saldo si es exitosa
 */
export async function rejectRechargeController(
  request: FastifyRequest<{ Params: PaymentParams; Body: RejectBody }>,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params
    const { rejectionReason } = request.body
    const { id: adminId, role } = (request as any).user

    if (role !== 'admin') {
      //->Se puede comentar para probar con un usuario normal, pero en producción esto debe estar activo para evitar que usuarios no autorizados puedan rechazar recargas
      //Si el rol del usuario no es admin, no tiene permiso para rechazar recargas
      return reply
        .status(401)
        .send({ success: false, error: 'Acceso no autorizado' })
    }

    if (!rejectionReason || rejectionReason.trim().length < 5) {
      return reply
        .status(400)
        .send({ success: false, message: 'Proporcione un motivo de rechazo.' })
    }

    const paymentValidation = await PaymentValidation.findById(id)

    if (!paymentValidation) {
      return reply.code(404).send({ message: 'Payment not found' })
    }

    if (paymentValidation.status !== 'pendiente') {
      return reply.code(400).send({ message: `The payment can't be rejected.` })
    }

    paymentValidation.status = 'rechazado'
    paymentValidation.rejectionReason = rejectionReason
    paymentValidation.reviewedBy = adminId
    paymentValidation.reviewedAt = new Date()
    await paymentValidation.save()

    return reply.code(200).send({ success: true, message: 'Payment rejected' })
  } catch (error) {
    console.error('Error rejecting payment:', error)
    return reply.code(500).send({ message: 'Error rejecting payment' })
  }
}
