import { FastifyRequest, FastifyReply } from 'fastify'
import { getBuses } from '../../models/bus.js'

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

export async function listarBuses(request: FastifyRequest, reply: FastifyReply) {
  try {
    const query = request.query as { status?: string }
    const filter: any = {}
    if (query.status) filter.status = query.status

    const buses = await getBuses(filter)

    return reply.status(200).send({
      success: true,
      count: buses.length,
      data: buses.map(formatBusForResponse),
    })
  } catch (error) {
    console.error('Error al listar autobuses:', error)
    return reply.status(500).send({ success: false, error: 'Error interno del servidor' })
  }
}
