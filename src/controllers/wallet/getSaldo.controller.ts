import { FastifyRequest, FastifyReply } from 'fastify'
// Ajusta la ruta de importación de tu modelo User según la estructura de tu proyecto
import { User } from '../../models/user'

export async function getSaldo(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Obtenemos el ID del usuario autenticado
    const userId = (request as any).user?.id

    if (!userId) {
      return reply.code(401).send({
        success: false,
        error: 'Usuario no autorizado',
      })
    }

    // Buscamos al usuario en la BD y solo traemos el campo 'credit' para ser eficientes
    const user = await User.findById(userId).select('credit')

    if (!user) {
      return reply.code(404).send({
        success: false,
        error: 'Usuario no encontrado',
      })
    }

    // Respondemos con código 200 y el saldo actual
    return reply.code(200).send({
      success: true,
      data: {
        saldo: user.credit || 0, // Si credit es undefined por alguna razón, devolvemos 0
      },
    })
  } catch (error) {
    console.error('Error al obtener saldo:', error)
    return reply.code(500).send({
      success: false,
      error: 'Error interno del servidor',
    })
  }
}
