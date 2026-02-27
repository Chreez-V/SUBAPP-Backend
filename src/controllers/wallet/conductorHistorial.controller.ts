import { FastifyRequest, FastifyReply } from 'fastify'
import { Transaction } from '../../models/transaction.js'

export async function conductorHistorial(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id: driverId } = (request as any).user || {}

    if (!driverId) {
      return reply.status(401).send({ success: false, error: 'No autorizado' })
    }

    const query = request.query as { page?: string; limit?: string; tipo?: string }
    const page = parseInt(query.page || '1', 10)
    const limit = parseInt(query.limit || '20', 10)
    const skip = (page - 1) * limit

    // Filtro base: transacciones donde el conductor participó
    const filter: any = {
      $or: [
        { driverId },          // cobro_pasaje, pagos recibidos
        { userId: driverId },  // retiros del conductor
      ],
    }

    // Filtro opcional por tipo de transacción
    if (query.tipo) {
      filter.type = query.tipo
    }

    const [transacciones, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(filter),
    ])

    return reply.status(200).send({
      success: true,
      data: transacciones,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error al obtener historial del conductor:', error)
    return reply.status(500).send({ success: false, error: 'Error interno del servidor' })
  }
}
