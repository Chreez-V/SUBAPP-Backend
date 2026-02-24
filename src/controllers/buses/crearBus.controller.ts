import { FastifyRequest, FastifyReply } from 'fastify'
import { createBus, getBusByPlaca } from '../../models/bus.js'
import { createBusSchema } from '../../validators/bus.schema.js'
import { z } from 'zod'

export async function crearBus(request: FastifyRequest, reply: FastifyReply) {
  try {
    const parsed = createBusSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: 'Error de validación',
        details: z.treeifyError(parsed.error),
      })
    }

    // Verificar placa duplicada
    const existing = await getBusByPlaca(parsed.data.placa)
    if (existing) {
      return reply.status(409).send({
        success: false,
        error: 'Ya existe un autobús registrado con esa placa',
      })
    }

    const bus = await createBus(parsed.data as any)

    return reply.status(201).send({
      success: true,
      message: 'Autobús registrado exitosamente',
      data: bus,
    })
  } catch (error: any) {
    if (error.code === 11000) {
      return reply.status(409).send({
        success: false,
        error: 'Ya existe un autobús con esa placa o número interno',
      })
    }
    console.error('Error al crear autobús:', error)
    return reply.status(500).send({ success: false, error: 'Error interno del servidor' })
  }
}
