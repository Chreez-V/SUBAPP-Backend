import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../../models/user'
import { Driver } from '../../models/driver' // ¡Importamos también el modelo Driver!

export async function getSaldo(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Extraemos el id y el role del token decodificado
    const { id: userId, role } = (request as any).user || {}

    if (!userId || !role) {
      return reply.status(401).send({ success: false, error: 'No autorizado' })
    }

    let saldo = 0

    // Buscamos el saldo dependiendo del rol del usuario
    if (role === 'passenger') {
      const user = await User.findById(userId).select('credit')
      if (!user) {
        return reply
          .status(404)
          .send({ success: false, error: 'Pasajero no encontrado' })
      }
      saldo = user.credit || 0
    } else if (role === 'driver') {
      const driver = await Driver.findById(userId).select('credit')
      if (!driver) {
        return reply
          .status(404)
          .send({ success: false, error: 'Conductor no encontrado' })
      }
      saldo = driver.credit || 0
    } else {
      // Si un admin intenta ver su saldo (no tienen billetera)
      return reply
        .status(403)
        .send({ success: false, error: 'Rol no autorizado para esta acción' })
    }

    return reply.status(200).send({
      success: true,
      data: { saldo },
    })
  } catch (error) {
    console.error('Error al obtener saldo:', error)
    return reply
      .status(500)
      .send({ success: false, error: 'Error interno del servidor' })
  }
}
