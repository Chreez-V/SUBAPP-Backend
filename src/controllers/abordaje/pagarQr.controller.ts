import { FastifyRequest, FastifyReply } from 'fastify';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '../../models/user';
import { Driver } from '../../models/driver';
import { BusFare } from '../../models/busfare';
import { DiscountProfile } from '../../models/discountProfile';
import { Transaction } from '../../models/transaction';

// Tipado del body (validado por Zod)
interface PagarQrBody {
  qrToken: string;
}

// Interfaz para el payload decodificado del JWT
interface QrPayload {
  driverId: string;
  routeId: string;
  tripId?: string;
}

export async function pagarQrController(request: FastifyRequest, reply: FastifyReply) {
  const { qrToken } = request.body as PagarQrBody;
  
  // Asumiendo que tu middleware inyecta el id del pasajero en request.user
  const passengerId = (request as any).user.id;

  // 1. Decodificar y validar el Token QR
  const secret = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
  let decodedToken: QrPayload;

  try {
    decodedToken = jwt.verify(qrToken, secret) as QrPayload;
  } catch (error) {
    return reply.code(400).send({ 
      success: false, 
      error: 'QR_EXPIRED_OR_INVALID' 
    });
  }

  const { driverId, routeId, tripId } = decodedToken;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 2. Obtener y verificar al pasajero (KYC Light) - Forzamos tipo 'any'
    const passenger: any = await User.findById(passengerId).session(session);
    if (!passenger) {
      throw new Error('USER_NOT_FOUND');
    }
    
    // Verificación de Perfil Completo (KYC Light)
    if (!passenger.isProfileComplete) {
      throw new Error('PROFILE_INCOMPLETE');
    }

    // 3. Obtener al conductor - Forzamos tipo 'any'
    const driver: any = await Driver.findById(driverId).session(session);
    if (!driver) {
      throw new Error('DRIVER_NOT_FOUND');
    }

    // 4. Calcular tarifa y aplicar descuento si corresponde (Vacunado con ObjectId)
    const busFare: any = await BusFare.findOne({ 
        routeId: new mongoose.Types.ObjectId(routeId) 
    }).session(session);
    
    if (!busFare) {
      throw new Error('FARE_NOT_FOUND');
    }

    // (Vacunado contra el NaN)
    let tarifaFinal = Number(busFare.fare) || Number(busFare.amount) || 0;
    let discountApplied = 0;
    let profileType = 'general';

    // Tratamos DiscountProfile como 'any' por ser un mock temporal
    const discount: any = await (DiscountProfile as any).findOne({ 
      userId: passenger._id, 
      status: 'aprobado' 
    }).session(session);

    // Verificamos que discountPercentage exista para evitar cálculos con undefined
    if (discount && discount.discountPercentage) {
      discountApplied = tarifaFinal * (discount.discountPercentage / 100);
      tarifaFinal -= discountApplied;
      profileType = discount.discountType || 'descuento';
    }

    // (Vacunado contra los saldos en undefined)
    const saldoPasajero = passenger.credit || 0;
    const saldoConductor = driver.credit || 0;

    // 5. Verificar Saldo del pasajero
    if (saldoPasajero < tarifaFinal) {
      throw new Error('INSUFFICIENT_BALANCE');
    }

    // 6. Transacción Atómica: Mover el dinero
    const previousPassengerBalance = saldoPasajero;
    const previousDriverBalance = saldoConductor;

    passenger.credit = saldoPasajero - tarifaFinal;
    driver.credit = saldoConductor + tarifaFinal;

    await passenger.save({ session });
    await driver.save({ session });

    // 7. Registrar Transacciones (Forzamos Transaction as any)
    // Transacción del Pasajero (Egreso)
    await (Transaction as any).create([{
      userId: passenger._id,
      type: 'pago_pasaje_qr',
      amount: tarifaFinal,
      previousBalance: previousPassengerBalance,
      newBalance: passenger.credit,
      routeId,
      driverId: driver._id,
      tripId,
      fareType: profileType,
      originalFare: busFare.fare,
      discountApplied
    }], { session });

    // Transacción del Conductor (Ingreso)
    await (Transaction as any).create([{
      userId: driver._id,
      type: 'cobro_pasaje',
      amount: tarifaFinal,
      previousBalance: previousDriverBalance,
      newBalance: driver.credit,
      routeId,
      driverId: driver._id,
      tripId
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // 8. Respuesta exitosa
    return reply.code(200).send({
      success: true,
      data: {
        approved: true,
        fare: tarifaFinal,
        newBalance: passenger.credit
      }
    });

  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    
    return reply.code(400).send({ 
      success: false, 
      error: error.message || 'Error procesando el pago con QR' 
    });
  }
}