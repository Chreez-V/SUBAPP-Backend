import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import isAuth from '../../middlewares/isAuth'

// Controladores del Pasajero
import {
    solicitarTarjeta,
    pagarTarjeta,
    vincularTarjeta,
    verMiTarjeta,
    bloquearMiTarjeta
} from '../../controllers/nfc/passengerNfc.controller'

// Controladores del Administrador
import {
    obtenerSolicitudes,
    obtenerSolicitudPorId,
    aprobarSolicitud,
    rechazarSolicitud,
    bloquearTarjetaAdmin
} from '../../controllers/nfc/adminNfc.controller'

// Validadores Zod
import {
    payNfcRequestSchema,
    linkNfcCardSchema,
    blockNfcCardSchema,
    rejectNfcRequestSchema
} from '../../validators/nfc.schema'

// Filtro de seguridad rápido para verificar si es Admin
const isAdmin = async (req: FastifyRequest, res: FastifyReply) => {
    const user = req.user as { role: string };
    if (user.role !== 'admin') {
    return res.status(403).send({ message: 'Acceso denegado. Acción exclusiva para administradores.' });
    }
}

export async function nfcRoutes(fastify: FastifyInstance) {

  // ==========================================
  // RUTAS DEL PASAJERO
  // ==========================================

fastify.post('/solicitar', { 
    preHandler: [isAuth] 
}, solicitarTarjeta)

fastify.post('/pagar-tarjeta', { 
    preHandler: [isAuth],
    schema: payNfcRequestSchema
}, pagarTarjeta)

fastify.post('/vincular', { 
    preHandler: [isAuth],
    schema: linkNfcCardSchema
}, vincularTarjeta)

fastify.get('/mi-tarjeta', { 
    preHandler: [isAuth] 
}, verMiTarjeta)

fastify.put('/bloquear', { 
    preHandler: [isAuth],
    schema: blockNfcCardSchema
}, bloquearMiTarjeta)


  // ==========================================
  // RUTAS DEL ADMINISTRADOR
  // ==========================================

fastify.get('/solicitudes', { 
    preHandler: [isAuth, isAdmin] 
}, obtenerSolicitudes)

fastify.get('/solicitudes/:id', { 
    preHandler: [isAuth, isAdmin] 
}, obtenerSolicitudPorId)

fastify.put('/solicitudes/:id/aprobar', { 
    preHandler: [isAuth, isAdmin] 
}, aprobarSolicitud)

fastify.put('/solicitudes/:id/rechazar', { 
    preHandler: [isAuth, isAdmin],
    schema: rejectNfcRequestSchema
}, rechazarSolicitud)

fastify.put('/admin/bloquear/:cardUid', { 
    preHandler: [isAuth, isAdmin],
    schema: blockNfcCardSchema
}, bloquearTarjetaAdmin)

}