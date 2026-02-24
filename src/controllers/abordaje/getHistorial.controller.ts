import { FastifyRequest, FastifyReply } from 'fastify';
import { Transaction } from '../../models/transaction';

export async function getHistorialController(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Asumiendo que tu middleware de auth inyecta el id del pasajero en request.user
    const passengerId = (request as any).user.id;

    // Buscar transacciones del pasajero que sean pagos de pasaje
    const historial = await Transaction.find({
      userId: passengerId,
      type: { $in: ['pago_pasaje_nfc', 'pago_pasaje_qr', 'pago_pasaje_movil'] }
    })
    // Usamos populate para traer info útil de otras colecciones (dependerá de si tus modelos lo soportan)
    .populate('routeId', 'name')
    .populate('driverId', 'name')
    .sort({ createdAt: -1 }) // Ordenar del más reciente al más antiguo
    .limit(50); // Buena práctica: limitar los resultados para no saturar

    return reply.code(200).send({
      success: true,
      data: historial
    });

  } catch (error: any) {
    return reply.code(500).send({ 
      success: false, 
      error: error.message || 'Error interno al obtener el historial de viajes' 
    });
  }
}