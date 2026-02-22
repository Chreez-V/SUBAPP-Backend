import { FastifyRequest, FastifyReply } from "fastify";
import { User } from "../../models/user";
import { Driver } from "../../models/driver";
import { Transaction } from "../../models/transaction";
import { PaymentValidation } from "../../models/paymentValidation";
import { verificarPerfilCompleto } from "../../utils/profileValidator";

export async function withdraw(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id: userId, role } = (request as any).user || {};

    if (!userId || !role) {
      return reply.status(401).send({ success: false, error: "No autorizado" });
    }

    const body = (request as any).body || {}
    // Accept both `amount` and `monto` for compatibility
    const rawAmount = body.amount ?? body.monto
    const value = Number(rawAmount)
    const banco = body.banco
    const cuenta = body.cuenta

    if (!value || isNaN(value) || value <= 0) {
      return reply
        .status(400)
        .send({ success: false, error: "Cantidad inválida" });
    }

    // 1) Obtener documento para verificar perfil y saldo antes de modificar
    let accountDoc: any = null
    if (role === 'driver') {
      accountDoc = await Driver.findById(userId).select('credit name fullName documentNumber phone')
    } else if (role === 'passenger') {
      accountDoc = await User.findById(userId).select('credit name fullName documentNumber phone')
    }

    if (!accountDoc) {
      return reply.status(404).send({ success: false, error: role === 'driver' ? 'Conductor no encontrado' : 'Pasajero no encontrado' })
    }


    // Verificar perfil con helper reutilizable
    try {
      verificarPerfilCompleto(accountDoc)
    } catch (err: any) {
      if (err && err.statusCode) {
        return reply.status(err.statusCode).send({ success: false, error: err.message, missingFields: err.missingFields, code: err.code })
      }
      throw err
    }

    // Verificar saldo suficiente antes de intentar la operación atómica
    if ((accountDoc.credit || 0) < value) {
      return reply.status(403).send({ success: false, error: 'Saldo insuficiente' })
    }

    // 2) Decremento atómico del saldo
    let updated: any = null
    if (role === 'driver') {
      updated = await Driver.findOneAndUpdate(
        { _id: userId, credit: { $gte: value } },
        { $inc: { credit: -value } },
        { new: true }
      ).select('credit')
    } else {
      updated = await User.findOneAndUpdate(
        { _id: userId, credit: { $gte: value } },
        { $inc: { credit: -value } },
        { new: true }
      ).select('credit')
    }

    if (!updated) {
      // Race condition: fue modificado entre la verificación y el update
      return reply.status(403).send({ success: false, error: 'Saldo insuficiente o cambio concurrente' })
    }

    // 3) Registrar Transaction y PaymentValidation
    const previousBalance = (updated.credit as number) + value
    const newBalance = updated.credit as number

    try {
      await Transaction.create({
        userId: userId,
        driverId: role === 'driver' ? userId : undefined,
        amount: value,
        type: 'retiro',
        previousBalance,
        newBalance,
        description: 'Retiro de saldo',
      })
    } catch (e) {
      console.error('No se pudo crear transaction:', e)
    }

    try {
      // referenciaPago es requerida por el schema; generamos una referencia única temporal
      const referenciaPago = `RETIRO-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
      await PaymentValidation.create({
        userId: userId,
        type: 'retiro',
        referenciaPago,
        monto: value,
        banco: banco,
        // guardamos cuenta en description para no romper el schema
        comprobantUrl: undefined,
        status: 'pendiente',
      })
    } catch (e) {
      console.error('No se pudo crear PaymentValidation:', e)
    }

    return reply.status(200).send({ success: true, message: 'Solicitud de retiro registrada' })
  } catch (error) {
    console.error("Error en withdraw:", error);
    return reply
      .status(500)
      .send({ success: false, error: "Error interno del servidor" });
  }
}
