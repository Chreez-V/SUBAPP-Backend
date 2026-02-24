import { FastifyRequest, FastifyReply } from 'fastify'
import { updateBus, getBusById } from '../../models/bus.js'
import { updateBusSchema } from '../../validators/bus.schema.js'
import { z } from 'zod'

export async function actualizarBus(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string }

    const parsed = updateBusSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: 'Error de validación',
        details: z.treeifyError(parsed.error),
      })
    }

    const existing = await getBusById(id)
    if (!existing) {
      return reply.status(404).send({ success: false, error: 'Autobús no encontrado' })
    }

    const updated = await updateBus(id, parsed.data as any)

    return reply.status(200).send({
      success: true,
      message: 'Autobús actualizado exitosamente',
      data: updated,
    })
  } catch (error: any) {
    if (error.code === 11000) {
      return reply.status(409).send({
        success: false,
        error: 'La placa o número interno ya está en uso por otro autobús',
      })
    }
    console.error('Error al actualizar autobús:', error)
    return reply.status(500).send({ success: false, error: 'Error interno del servidor' })
  }
}
