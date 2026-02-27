import { FastifyRequest, FastifyReply } from 'fastify'
import { updateUserProfile } from '../../models/user.js'

interface CompletarPerfilBody {
  cedula?: string
  birthDate?: string
  phone?: string
  idDocumentImageUrl?: string
}

export async function completarPerfil(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id: userId } = (request as any).user || {}

    if (!userId) {
      return reply.status(401).send({ success: false, error: 'No autorizado' })
    }

    const body = request.body as CompletarPerfilBody

    if (!body.cedula && !body.birthDate && !body.phone && !body.idDocumentImageUrl) {
      return reply.status(400).send({
        success: false,
        error: 'Debes enviar al menos un campo para actualizar (cedula, birthDate, phone, idDocumentImageUrl)',
      })
    }

    // Construir datos a actualizar
    const data: {
      cedula?: string
      birthDate?: Date
      phone?: string
      idDocumentImageUrl?: string
    } = {}

    if (body.cedula) data.cedula = body.cedula
    if (body.birthDate) data.birthDate = new Date(body.birthDate)
    if (body.phone) data.phone = body.phone
    if (body.idDocumentImageUrl) data.idDocumentImageUrl = body.idDocumentImageUrl

    const updatedUser = await updateUserProfile(userId, data)

    if (!updatedUser) {
      return reply.status(404).send({ success: false, error: 'Usuario no encontrado' })
    }

    return reply.status(200).send({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        cedula: updatedUser.cedula,
        birthDate: updatedUser.birthDate,
        phone: updatedUser.phone,
        idDocumentImageUrl: updatedUser.idDocumentImageUrl,
        isProfileComplete: updatedUser.isProfileComplete,
      },
    })
  } catch (error: any) {
    // Handle duplicate cedula error
    if (error.code === 11000) {
      return reply.status(409).send({
        success: false,
        error: 'La cédula proporcionada ya está registrada por otro usuario',
      })
    }
    console.error('Error al completar perfil:', error)
    return reply.status(500).send({ success: false, error: 'Error interno del servidor' })
  }
}
