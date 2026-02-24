import { FastifyRequest, FastifyReply } from 'fastify'
import { Driver } from '../../models/driver.js'
import { Transaction } from '../../models/transaction.js'

interface RetirarBody {
  monto: number
  descripcion?: string
}

export async function retirarSaldo(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id: driverId } = (request as any).user || {}

    if (!driverId) {
      return reply.status(401).send({ success: false, error: 'No autorizado' })
    }

    const { monto, descripcion } = request.body as RetirarBody

    if (!monto || monto <= 0) {
      return reply.status(400).send({
        success: false,
        error: 'El monto debe ser un número positivo',
      })
    }

    const driver = await Driver.findById(driverId)
    if (!driver) {
      return reply.status(404).send({ success: false, error: 'Conductor no encontrado' })
    }

    // Verificar que el conductor tenga un método de pago registrado
    if (!driver.paymentMethod || !driver.paymentMethod.type) {
      return reply.status(400).send({
        code: 'NO_PAYMENT_METHOD',
        success: false,
        error: 'Debes registrar un método de pago antes de retirar saldo',
      })
    }

    // Verificar saldo suficiente
    if ((driver.credit || 0) < monto) {
      return reply.status(400).send({
        code: 'INSUFFICIENT_BALANCE',
        success: false,
        error: 'Saldo insuficiente para realizar el retiro',
        data: { saldoActual: driver.credit || 0, montoSolicitado: monto },
      })
    }

    const previousBalance = driver.credit || 0
    const newBalance = previousBalance - monto

    // Actualizar saldo del conductor
    driver.credit = newBalance
    await driver.save()

    // Registrar la transacción
    const transaction = new Transaction({
      userId: driverId,
      type: 'retiro',
      amount: monto,
      previousBalance,
      newBalance,
      description: descripcion || 'Retiro de saldo del conductor',
    })
    await transaction.save()

    return reply.status(200).send({
      success: true,
      message: 'Retiro realizado exitosamente',
      data: {
        transaccionId: transaction._id,
        monto,
        saldoAnterior: previousBalance,
        nuevoSaldo: newBalance,
        metodo: driver.paymentMethod.type,
      },
    })
  } catch (error) {
    console.error('Error al retirar saldo:', error)
    return reply.status(500).send({ success: false, error: 'Error interno del servidor' })
  }
}
