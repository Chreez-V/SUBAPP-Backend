import { FastifyRequest, FastifyReply } from 'fastify';
import { Transaction } from '../../models/transaction';

export async function conductorRegistroController(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Asumiendo que tu middleware de auth inyecta el ID del conductor
    const driverId = (request as any).user.id;

    // Buscar transacciones donde este conductor recibió un cobro
    const registro = await Transaction.find({
      driverId: driverId,
      type: 'cobro_pasaje' // Solo los ingresos por pasajes cobrados
    })
    .populate('routeId', 'name') // Opcional: trae el nombre de la ruta
    .sort({ createdAt: -1 }) // Del más reciente al más antiguo
    .limit(100); // Límite para mostrar los cobros del turno actual

    return reply.code(200).send({
      success: true,
      data: registro
    });

  } catch (error: any) {
    return reply.code(500).send({ 
      success: false, 
      error: error.message || 'Error interno al obtener el registro del conductor' 
    });
  }
}