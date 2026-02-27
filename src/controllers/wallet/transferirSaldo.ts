import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../../models/user.js'
import { Transaction } from '../../models/transaction.js'
import { transferirSchema } from '../../validators/wallet.schema.js'

export async function transferirSaldo(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // Validamos la entrada usando el esquema de Zod

    const parsedBody = transferirSchema.safeParse({ body: request.body })

    if (!parsedBody.success) {
      return reply.status(400).send({
        success: false,
        error: 'Error de validación',
        details: parsedBody.error.issues, // Detalles específicos de los errores de validación
      })
    }

    const { destinatarioEmail, destinatarioId, monto } = parsedBody.data.body
    const { id: senderId } = (request as any).user
    const sender = await User.findById(senderId)
    if (!sender) {
      return reply.status(404).send({
        success: false,
        error: 'Usuario remitente no encontrado',
      })
    }

    const senderPreviousBalance = sender.credit || 0

    if (senderPreviousBalance < monto) {
      return reply
        .status(400)
        .send({ success: false, error: 'Saldo insuficiente' })
    }

    const receiver = await User.findOne({
      email: destinatarioEmail,
      //cedula: destinatarioId
    })
    if (!receiver) {
      return reply.status(404).send({
        success: false,
        error: 'Usuario destinatario no encontrado',
      })
    }

    if (sender._id.toString() === receiver._id.toString()) {
      return reply.status(400).send({
        success: false,
        error: 'No puedes transferirte a ti mismo',
      })
    }

    const receiverPreviousBalance = receiver.credit || 0

    sender.credit = senderPreviousBalance - monto
    receiver.credit = receiverPreviousBalance + monto

    const senderTransaction = new Transaction({
      userId: sender._id,
      type: 'transferencia_enviada',
      amount: monto,
      previousBalance: senderPreviousBalance,
      newBalance: sender.credit,
      targetUserId: receiver._id,
      description: `Transferencia enviada a ${receiver.email}`,
    })

    const receiverTransaction = new Transaction({
      userId: receiver._id,
      type: 'transferencia_recibida',
      amount: monto,
      previousBalance: receiverPreviousBalance,
      newBalance: receiver.credit,
      sourceUserId: sender._id, // ¡Usando tu campo P2P!
      description: `Transferencia recibida de ${sender.email}`,
    })

    await senderTransaction.validate()
    await receiverTransaction.validate()

    await Promise.all([
      sender.save(),
      receiver.save(),
      senderTransaction.save(),
      receiverTransaction.save(),
    ])

    return reply.status(200).send({
      success: true,
      message: 'Transferencia realizada con exito',
      data: {
        montoTransferido: monto,
        nuevoSaldo: sender.credit,
        destinatario: receiver.email,
      },
    })
  } catch (error) {
    console.error('Error en la transferencia:', error)
    return reply.status(500).send({
      success: false,
      error: 'Error interno del servidor',
    })
  }
}
