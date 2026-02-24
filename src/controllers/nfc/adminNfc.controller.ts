import { FastifyRequest, FastifyReply } from 'fastify'
import { NfcCardRequest } from '../../models/nfcCardRequest'
import { NfcCard } from '../../models/nfcCard'

export interface JwtPayload {
    _id: string;
    role: string;
}

// 1. Obtener todas las solicitudes (Para la tabla del panel Admin)
export const obtenerSolicitudes = async (req: FastifyRequest, res: FastifyReply) => {
    try {
    // Se usa .populate() para traer el nombre y correo del pasajero, no solo su ID
    const solicitudes = await NfcCardRequest.find()
        .populate('userId', 'fullName email')
      .sort({ createdAt: -1 }); // Las más recientes primero

    return res.status(200).send({ solicitudes });
    } catch (error) {
    console.error('Error en obtenerSolicitudes:', error);
    return res.status(500).send({ message: 'Error interno del servidor', error });
    }
}

// 2. Obtener el detalle de una sola solicitud
export const obtenerSolicitudPorId = async (req: FastifyRequest, res: FastifyReply) => {
    try {
    const { id } = req.params as { id: string };

    const solicitud = await NfcCardRequest.findById(id).populate('userId', 'fullName email');
    if (!solicitud) {
        return res.status(404).send({ message: 'Solicitud no encontrada.' });
    }

    return res.status(200).send({ solicitud });
    } catch (error) {
    console.error('Error en obtenerSolicitudPorId:', error);
    return res.status(500).send({ message: 'Error interno del servidor', error });
    }
}

// 3. Aprobar una solicitud
export const aprobarSolicitud = async (req: FastifyRequest, res: FastifyReply) => {
    try {
    const admin = req.user as JwtPayload;
    const { id } = req.params as { id: string };

    const solicitud = await NfcCardRequest.findById(id);
    if (!solicitud) {
        return res.status(404).send({ message: 'Solicitud no encontrada.' });
    }

    if (solicitud.status !== 'pendiente_revision') {
        return res.status(400).send({ message: `No se puede aprobar. Estado actual: ${solicitud.status}` });
    }

    // HUECO PARA EL CÓDIGO DE SEBASTIÁN
    // Aquí, cuando él termine, buscaremos el PaymentValidation asociado y lo pasaremos a "aprobado".
    
    solicitud.status = 'aprobada';
    solicitud.reviewedBy = admin._id as any; // Guardamos qué admin lo aprobó
    solicitud.reviewedAt = new Date();
    await solicitud.save();

    return res.status(200).send({ message: 'Solicitud aprobada exitosamente.', solicitud });
    } catch (error) {
    console.error('Error en aprobarSolicitud:', error);
    return res.status(500).send({ message: 'Error interno del servidor', error });
    }
}

// 4. Rechazar una solicitud
export const rechazarSolicitud = async (req: FastifyRequest, res: FastifyReply) => {
    try {
    const admin = req.user as JwtPayload;
    const { id } = req.params as { id: string };
    const { rejectionReason } = req.body as { rejectionReason: string };

    const solicitud = await NfcCardRequest.findById(id);
    if (!solicitud) {
        return res.status(404).send({ message: 'Solicitud no encontrada.' });
    }

    solicitud.status = 'rechazada';
    solicitud.rejectionReason = rejectionReason;
    solicitud.reviewedBy = admin._id as any;
    solicitud.reviewedAt = new Date();
    await solicitud.save();

    return res.status(200).send({ message: 'Solicitud rechazada.', solicitud });
    } catch (error) {
    console.error('Error en rechazarSolicitud:', error);
    return res.status(500).send({ message: 'Error interno del servidor', error });
    }
}

// 5. Bloquear tarjeta de cualquier usuario por UID
export const bloquearTarjetaAdmin = async (req: FastifyRequest, res: FastifyReply) => {
    try {
    const { cardUid } = req.params as { cardUid: string };
    const { blockedReason } = req.body as { blockedReason?: string };

    const tarjeta = await NfcCard.findOne({ cardUid, status: 'activa' });
    if (!tarjeta) {
        return res.status(404).send({ message: 'No se encontró una tarjeta activa con ese UID.' });
    }

    tarjeta.status = 'bloqueada';
    tarjeta.blockedReason = blockedReason || 'Bloqueada por un administrador.';
    await tarjeta.save();

    return res.status(200).send({ message: 'Tarjeta bloqueada exitosamente por el administrador.', tarjeta });
    } catch (error) {
    console.error('Error en bloquearTarjetaAdmin:', error);
    return res.status(500).send({ message: 'Error interno del servidor', error });
    }
}