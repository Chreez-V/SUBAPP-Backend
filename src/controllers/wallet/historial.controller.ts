import { FastifyRequest, FastifyReply } from 'fastify'
import { Transaction } from '../../models/transaction'

export async function obtenerHistorial(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // 1. Sacamos el ID del usuario logueado desde el token
    const { id: userId } = (request as any).user

    // 2. Configuramos la paginación recibida por Query Params (?page=1&limit=10)
    const query = request.query as { page?: string; limit?: string }
    const page = parseInt(query.page || '1', 10)
    const limit = parseInt(query.limit || '10', 10)
    const skip = (page - 1) * limit

    // 3. Buscamos en la BD: filtramos por su ID, ordenamos descendente
    const transacciones = await Transaction.find({
      $or: [
        { userId: userId }, // Transacciones donde él es el actor principal
        { targetUserId: userId }, // Transferencias donde él recibió dinero (P2P)
        { sourceUserId: userId }, // Transferencias donde él envió dinero (P2P)
      ],
    })
      .sort({ createdAt: -1 }) // -1 significa de más reciente a más antiguo
      .skip(skip)
      .limit(limit)

    // 4. Contamos el total real de documentos para que el frontend arme los botoncitos de "Siguiente" xd
    const total = await Transaction.countDocuments({
      $or: [
        { userId: userId },
        { targetUserId: userId },
        { sourceUserId: userId },
      ],
    })

    // 5. Devolvemos el éxito con la data lista para pintar en la app
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
    console.error('Error al obtener el historial de transacciones:', error)
    return reply.status(500).send({
      success: false,
      error: 'Error interno del servidor al obtener el historial',
    })
  }
}
