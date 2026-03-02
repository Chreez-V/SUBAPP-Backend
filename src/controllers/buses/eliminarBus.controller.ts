import { FastifyRequest, FastifyReply } from 'fastify'
import { deleteBus, getBusById } from '../../models/bus.js'

export async function eliminarBus(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string }

    const existing = await getBusById(id)
    if (!existing) {
      return reply.status(404).send({ success: false, error: 'Autobús no encontrado' })
    }

    await deleteBus(id)

    return reply.status(200).send({
      success: true,
      message: 'Autobús eliminado exitosamente',
    })
  } catch (error) {
    console.error('Error al eliminar autobús:', error)
    return reply.status(500).send({ success: false, error: 'Error interno del servidor' })
  }
}
