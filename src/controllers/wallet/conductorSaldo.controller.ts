import { FastifyRequest, FastifyReply } from 'fastify'
import { Driver } from '../../models/driver.js'

export async function conductorSaldo(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id: driverId } = (request as any).user || {}

    if (!driverId) {
      return reply.status(401).send({ success: false, error: 'No autorizado' })
    }

    const driver = await Driver.findById(driverId).select('credit name')
    if (!driver) {
      return reply.status(404).send({ success: false, error: 'Conductor no encontrado' })
    }

    return reply.status(200).send({
      success: true,
      data: {
        saldo: driver.credit || 0,
        conductor: driver.name,
      },
    })
  } catch (error) {
    console.error('Error al obtener saldo del conductor:', error)
    return reply.status(500).send({ success: false, error: 'Error interno del servidor' })
  }
}
