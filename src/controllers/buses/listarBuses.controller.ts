import { FastifyRequest, FastifyReply } from 'fastify'
import { getBuses } from '../../models/bus.js'

export async function listarBuses(request: FastifyRequest, reply: FastifyReply) {
  try {
    const query = request.query as { status?: string }
    const filter: any = {}
    if (query.status) filter.status = query.status

    const buses = await getBuses(filter)

    return reply.status(200).send({
      success: true,
      count: buses.length,
      data: buses,
    })
  } catch (error) {
    console.error('Error al listar autobuses:', error)
    return reply.status(500).send({ success: false, error: 'Error interno del servidor' })
  }
}
