import { FastifyRequest, FastifyReply } from 'fastify'
import { getBusById } from '../../models/bus.js'

const formatBusForResponse = (bus: any) => {
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

export async function obtenerBus(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string }
    const bus = await getBusById(id)

    if (!bus) {
      return reply.status(404).send({ success: false, error: 'Autobús no encontrado' })
    }

    return reply.status(200).send({ success: true, data: formatBusForResponse(bus) })
  } catch (error) {
    console.error('Error al obtener autobús:', error)
    return reply.status(500).send({ success: false, error: 'Error interno del servidor' })
  }
}
