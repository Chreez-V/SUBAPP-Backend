import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { Driver } from '../../models/driver';

interface GenerarQrBody {
  routeId: string;
  tripId?: string;
}

export async function generarQrController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { routeId, tripId } = request.body as GenerarQrBody;
    const driverId = (request as any).user.id;

    const driver = await Driver.findById(driverId);
    if (!driver || !driver.paymentMethod) {
      return reply.code(400).send({ 
        success: false, 
        error: 'PAYMENT_METHOD_REQUIRED' 
      });
    }

    const secret = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
    
    const tokenPayload = {
      driverId: driver._id.toString(),
      routeId,
      tripId: tripId || null
    };

    // Subimos a 15 minutos para que no te presione el tiempo en las pruebas
    const qrToken = jwt.sign(tokenPayload, secret, { expiresIn: '15m' });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

    return reply.code(200).send({
      success: true,
      data: {
        qrToken, // <-- Enviamos el token limpio para que lo copies fácil
        qrPayload: `suba://pay?token=${qrToken}&route=${routeId}&driver=${driver._id.toString()}`,
        expiresAt,
        driverPaymentInfo: driver.paymentMethod
      }
    });

  } catch (error: any) {
    return reply.code(500).send({ 
      success: false, 
      error: error.message || 'Error interno al generar el código QR' 
    });
  }
}