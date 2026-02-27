import { FastifyRequest, FastifyReply } from 'fastify'
import { updateBus, getBusById } from '../../models/bus.js'
import { updateBusSchema } from '../../validators/bus.schema.js'
import { z } from 'zod'
import { Types } from 'mongoose'

const formatBusForResponse = (bus: any) => {
  if (!bus) return bus

  const formatted = {
    ...bus,
    placa: bus.plate,
    marca: bus.brand,
    modelo: bus.vehicleModel,
    anio: bus.year,
    capacidad: bus.capacity,
    numeroInterno: bus.fleetNumber,
  }

  delete formatted.plate
  delete formatted.brand
  delete formatted.vehicleModel
  delete formatted.year
  delete formatted.capacity
  delete formatted.fleetNumber

  return formatted
}

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

    const payload = {
      plate: parsed.data.placa,
      brand: parsed.data.marca,
      vehicleModel: parsed.data.modelo,
      year: parsed.data.anio,
      capacity: parsed.data.capacidad,
      status: parsed.data.status,
      assignedRouteId:
        parsed.data.assignedRouteId === null
          ? null
          : parsed.data.assignedRouteId
            ? new Types.ObjectId(parsed.data.assignedRouteId)
            : undefined,
      assignedDriverId:
        parsed.data.assignedDriverId === null
          ? null
          : parsed.data.assignedDriverId
            ? new Types.ObjectId(parsed.data.assignedDriverId)
            : undefined,
      color: parsed.data.color,
      fleetNumber: parsed.data.numeroInterno,
    }

    const updatePayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    )

    const existing = await getBusById(id)
    if (!existing) {
      return reply.status(404).send({ success: false, error: 'Autobús no encontrado' })
    }

    const updated = await updateBus(id, updatePayload as any)

    return reply.status(200).send({
      success: true,
      message: 'Autobús actualizado exitosamente',
      data: formatBusForResponse(updated),
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
