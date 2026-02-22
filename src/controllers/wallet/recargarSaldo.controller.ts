import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '@/models/user'
import { PaymentValidation } from '@/models/paymentValidation'
import { recargarSchema } from '@/validators/wallet.schema'

export async function recargarSaldo(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // Validamos la entrada usando el esquema de Zod
    const parsedBody = recargarSchema.safeParse(request.body)

    if (!parsedBody.success) {
      //Si hay errores de validacion enviamos codigo 400 con el mensaje error
      return reply.status(400).send({
        success: false,
        error: 'Error de validación', // enviamos el error de validación
        details: parsedBody.error.flatten(), // Detalles específicos de los errores de validación
      })
    }

    const { referenciaPago, monto, banco, fechaPago, comprobanteUrl } =
      parsedBody.data.body

    //2.- extraemos el id del usuario del token decodificado

    const { id: userId, role } = (request as any).user || {} //Solo los pasajeros pueden recargar saldo, los conductores no tienen esta funcionalidad

    if (!userId || role !== 'passenger') {
      return reply.status(403).send({
        success: false,
        error: 'No autorizado, solo los pasajeros pueden recargar saldo',
      })
    }

    const user = await User.findById(userId) // Buscamos al usario en la bd

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: 'Usuario no encontrado',
      })
    }

    //validamos que el usuario tenga sus datos completos para realizar la recarga, como CI, Fecha de nacimiento y Telefono

    if (!user.cedula || !user.birthDate || !user.phone) {
      return reply.status(400).send({
        code: 'PROFILE_INCOMPLETE',
        success: false,
        missingFields: {
          cedula: !user.cedula,
          birthDate: !user.birthDate,
          phone: !user.phone,
        },
        error:
          'Perfil incompleto, por favor complete su perfil para recargar saldo',
      })
    }

    //Verificamos que la referencia de pago no haya sido utilizada antes para evitar recargas duplicadas

    const existingPayment = await PaymentValidation.findOne({ referenciaPago })
    if (existingPayment) {
      return reply.status(400).send({
        code: 'DUPLICATE_PAYMENT',
        success: false,
        error:
          'La referencia de pago ya ha sido utilizada para una recarga anterior',
      })
    }

    const newPayment = new PaymentValidation({
      userId,
      type: 'recarga',
      referenciaPago,
      monto,
      banco,
      fechaPago,
      comprobantUrl: comprobanteUrl,
      status: 'pending', // El estado inicial es 'pending' hasta que un admin lo revise y apruebe o rechace
    })

    await newPayment.save()
    // Si todo es correcto, respondemos con éxito
    return reply.status(200).send({
      success: true,
      message:
        'Recarga registrada exitosamente, está pendiente de revisión por el equipo administrativo',
      data: {
        id: newPayment._id,
        referenciaPago: newPayment.referenciaPago,
        monto: newPayment.monto,
        status: newPayment.status,
      },
    })
  } catch (error) {
    console.error('Error al recargar saldo:', error)
    return reply.status(500).send({
      success: false,
      error: 'Error interno del servidor',
    })
  }
}
