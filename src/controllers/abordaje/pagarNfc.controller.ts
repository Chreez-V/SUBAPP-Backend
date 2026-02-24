import { FastifyRequest, FastifyReply } from 'fastify';
import mongoose from 'mongoose';
import { Driver } from '../../models/driver';
import { NfcCard } from '../../models/nfcCard';
import { User } from '../../models/user';
import { BusFare } from '../../models/busfare';
import { DiscountProfile } from '../../models/discountProfile';
import { Transaction } from '../../models/transaction';

interface PagarNfcBody {
  cardUid: string;
  routeId: string;
  tripId?: string;
}

export async function pagarNfcController(request: FastifyRequest, reply: FastifyReply) {
  const { cardUid, routeId, tripId } = request.body as PagarNfcBody;
  
  // Asumiendo que tu middleware de auth inyecta el usuario/driver en request.user
  const driverId = (request as any).user.id; 

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    
    // 1. Validar que el Conductor exista
    const driver: any = await Driver.findById(driverId).session(session);
    if (!driver) {
      throw new Error('DRIVER_NOT_FOUND');
    }

    // 2. Validar Tarjeta NFC (Tratamos el modelo como 'any')
    const nfcCard: any = await (NfcCard as any).findOne({ cardUid }).session(session);
    if (!nfcCard || nfcCard.status !== 'activa') {
      throw new Error('CARD_NOT_FOUND_OR_BLOCKED');
    }

    // 3. Obtener Usuario Dueño de la Tarjeta
    const user: any = await User.findById(nfcCard.userId).session(session);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // 4. Calcular Tarifa y Descuentos
    const busFare: any = await BusFare.findOne({ 
        routeId: new mongoose.Types.ObjectId(routeId) 
    }).session(session);

    if (!busFare) {
        throw new Error('FARE_NOT_FOUND');
    }
    

   let tarifaFinal = Number(busFare.fare) || Number(busFare.amount) || 0;
    let discountApplied = 0;
    let profileType = 'general';

    const discount: any = await (DiscountProfile as any).findOne({ 
      userId: user._id, 
      status: 'aprobado' 
    }).session(session);

    if (discount && discount.discountPercentage) {
      discountApplied = tarifaFinal * (discount.discountPercentage / 100);
      tarifaFinal -= discountApplied;
      profileType = discount.discountType || 'descuento';
    }

    // Asegurarnos de que los saldos sean números válidos (si no existen, valen 0)
    const saldoUsuario = user.credit || 0;
    const saldoConductor = driver.credit || 0;

    // 5. Verificar Saldo
    if (saldoUsuario < tarifaFinal) {
      throw new Error('INSUFFICIENT_BALANCE');
    }

    // 6. Transacción Atómica: Actualizar Saldos
    const previousUserBalance = saldoUsuario;
    const previousDriverBalance = saldoConductor;

    user.credit = saldoUsuario - tarifaFinal;
    driver.credit = saldoConductor + tarifaFinal;
    nfcCard.lastUsedAt = new Date();

    await user.save({ session });
    await driver.save({ session });
    await nfcCard.save({ session });

    // 7. Registrar Transacciones (Forzamos Transaction as any)
    await (Transaction as any).create([{
      userId: user._id,
      type: 'pago_pasaje_nfc',
      amount: tarifaFinal,
      previousBalance: previousUserBalance,
      newBalance: user.credit,
      routeId,
      driverId: driver._id,
      tripId,
      fareType: profileType,
      originalFare: busFare.fare,
      discountApplied,
      cardUid
    }], { session });

    await (Transaction as any).create([{
      userId: driver._id,
      type: 'cobro_pasaje',
      amount: tarifaFinal,
      previousBalance: previousDriverBalance,
      newBalance: driver.credit,
      routeId,
      driverId: driver._id,
      tripId,
      cardUid
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return reply.code(200).send({
      approved: true,
      fare: tarifaFinal,
      discount: discountApplied,
      newBalance: user.credit,
      profile: profileType
    });

  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    
    return reply.code(400).send({ 
      approved: false, 
      reason: error.message || 'ERROR_PROCESSING_PAYMENT' 
    });
  }
}