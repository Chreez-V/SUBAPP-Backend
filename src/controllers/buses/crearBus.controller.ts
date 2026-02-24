import { FastifyRequest, FastifyReply } from 'fastify'
import { createBus, getBusByPlate } from '../../models/bus.js'
import { createBusSchema } from '../../validators/bus.schema.js'
import { z } from 'zod'
import { Types } from 'mongoose'

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

    const payload = {
      plate: parsed.data.placa,
      brand: parsed.data.marca,
      vehicleModel: parsed.data.modelo,
      year: parsed.data.anio,
      capacity: parsed.data.capacidad,
      status: parsed.data.status,
      assignedRouteId: parsed.data.assignedRouteId ? new Types.ObjectId(parsed.data.assignedRouteId) : undefined,
      assignedDriverId: parsed.data.assignedDriverId ? new Types.ObjectId(parsed.data.assignedDriverId) : undefined,
      color: parsed.data.color,
      fleetNumber: parsed.data.numeroInterno,
    }

    // Verificar placa duplicada
    const existing = await getBusByPlate(payload.plate)
    if (existing) {
      return reply.status(409).send({
        success: false,
        error: 'Ya existe un autobús registrado con esa placa',
      })
    }

    const bus = await createBus(payload)

    const responseBus = {
      ...bus.toObject(),
      placa: bus.plate,
      marca: bus.brand,
      modelo: bus.vehicleModel,
      anio: bus.year,
      capacidad: bus.capacity,
      numeroInterno: bus.fleetNumber,
    }

    delete (responseBus as any).plate
    delete (responseBus as any).brand
    delete (responseBus as any).vehicleModel
    delete (responseBus as any).year
    delete (responseBus as any).capacity
    delete (responseBus as any).fleetNumber

    return reply.status(201).send({
      success: true,
      message: 'Autobús registrado exitosamente',
      data: responseBus,
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
