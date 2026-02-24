import { FastifyRequest, FastifyReply } from 'fastify'
import { NfcCardRequest } from '../../models/nfcCardRequest'
import { NfcCard } from '../../models/nfcCard'

// 1. Definimos la forma exacta del Token JWT
export interface JwtPayload {
    userId: string; 
    role: string;
}

// 2. Endpoint: Iniciar la solicitud de una tarjeta NFC
export const solicitarTarjeta = async (req: FastifyRequest, res: FastifyReply) => {
    try {
    const user = req.user as JwtPayload;
    const userId = user.userId; 

    if (!userId) {
        return res.status(401).send({ message: 'Error: El token no contiene el ID del usuario.' });
    }

    const tarjetaActiva = await NfcCard.findOne({ userId, status: 'activa' })
    if (tarjetaActiva) {
        return res.status(400).send({ message: 'Ya posees una tarjeta NFC activa.' })
    }

    const solicitudPendiente = await NfcCardRequest.findOne({
        userId,
        status: { $in: ['pendiente_pago', 'pendiente_revision', 'aprobada'] }
    })
    if (solicitudPendiente) {
        return res.status(400).send({ 
        message: 'Ya tienes una solicitud en proceso.', 
        estadoActual: solicitudPendiente.status 
        })
    }

    const nuevaSolicitud = await NfcCardRequest.create({
        userId,
        status: 'pendiente_pago',
        emissionAmount: 50 
    })

    return res.status(201).send({ 
        message: 'Solicitud creada con éxito. Por favor, procede a registrar tu pago.', 
        solicitud: nuevaSolicitud 
    })
    } catch (error) {
    console.error('Error en solicitarTarjeta:', error)
    return res.status(500).send({ message: 'Error interno del servidor', error })
    }
}

// 3. Endpoint: Reportar el pago del plástico
export const pagarTarjeta = async (req: FastifyRequest, res: FastifyReply) => {
    try {
    const user = req.user as JwtPayload;
    const userId = user.userId;
    
    if (!userId) {
        return res.status(401).send({ message: 'Error de autenticación.' });
    }

    const { reference } = req.body as { reference: string };

    const solicitud = await NfcCardRequest.findOne({ userId, status: 'pendiente_pago' })
    if (!solicitud) {
        return res.status(404).send({ message: 'No tienes ninguna solicitud pendiente de pago.' })
    }

    // CÓDIGO DE SEBASTIÁN (PaymentValidation)
    // const pago = await PaymentValidation.create({ userId, reference, amount: 50 })
    // solicitud.paymentValidationId = pago._id

    solicitud.status = 'pendiente_revision'
    await solicitud.save()

    return res.status(200).send({ 
        message: 'Pago registrado (simulado). En espera de revisión por un administrador.', 
        solicitud 
    })
    } catch (error) {
    console.error('Error en pagarTarjeta:', error)
    return res.status(500).send({ message: 'Error interno del servidor', error })
    }
}

// 4. Endpoint: Vincular la tarjeta física con la cuenta
export const vincularTarjeta = async (req: FastifyRequest, res: FastifyReply) => {
    try {
    const user = req.user as JwtPayload;
    const userId = user.userId;

    if (!userId) {
        return res.status(401).send({ message: 'Error de autenticación.' });
    }

    const { cardUid } = req.body as { cardUid: string };

    const solicitud = await NfcCardRequest.findOne({ userId, status: 'aprobada' });
    if (!solicitud) {
        return res.status(400).send({ 
        message: 'No tienes una solicitud aprobada lista para vincular. Revisa el estado de tu trámite.' 
        });
    }

    const tarjetaExistente = await NfcCard.findOne({ cardUid });
    if (tarjetaExistente) {
        return res.status(400).send({ 
        message: 'Esta tarjeta física ya se encuentra registrada en el sistema.' 
        });
    }

    const nuevaTarjeta = await NfcCard.create({
        cardUid,
        userId,
        status: 'activa',
        requestId: solicitud._id
    });

    solicitud.status = 'vinculada';
    solicitud.linkedCardUid = cardUid;
    solicitud.linkedAt = new Date();
    await solicitud.save();

    return res.status(200).send({ 
        message: '¡Tarjeta vinculada con éxito! Ya puedes usarla para pagar tus pasajes.',
        tarjeta: nuevaTarjeta 
    });
    } catch (error) {
    console.error('Error en vincularTarjeta:', error);
    return res.status(500).send({ message: 'Error interno del servidor', error });
    }
}

// 5. Endpoint: Ver mi tarjeta activa
export const verMiTarjeta = async (req: FastifyRequest, res: FastifyReply) => {
    try {
    const user = req.user as JwtPayload;
    const userId = user.userId;

    if (!userId) {
        return res.status(401).send({ message: 'Error de autenticación.' });
    }

    const tarjeta = await NfcCard.findOne({ userId, status: 'activa' }).select('-__v');
    
    if (!tarjeta) {
        return res.status(404).send({ message: 'No posees ninguna tarjeta activa en este momento.' });
    }

    return res.status(200).send({ tarjeta });
    } catch (error) {
    console.error('Error en verMiTarjeta:', error);
    return res.status(500).send({ message: 'Error interno del servidor', error });
    }
}

// 6. Endpoint: Bloquear tarjeta
export const bloquearMiTarjeta = async (req: FastifyRequest, res: FastifyReply) => {
    try {
    const user = req.user as JwtPayload;
    const userId = user.userId;

    if (!userId) {
        return res.status(401).send({ message: 'Error de autenticación.' });
    }

    const { blockedReason } = req.body as { blockedReason?: string };

    const tarjeta = await NfcCard.findOne({ userId, status: 'activa' });
    if (!tarjeta) {
        return res.status(404).send({ message: 'No tienes una tarjeta activa para bloquear.' });
    }

    tarjeta.status = 'bloqueada';
    tarjeta.blockedReason = blockedReason || 'Bloqueada por el usuario desde la app';
    await tarjeta.save();

    return res.status(200).send({ 
        message: 'Tu tarjeta ha sido bloqueada exitosamente por seguridad.',
        tarjeta 
    });
    } catch (error) {
    console.error('Error en bloquearMiTarjeta:', error);
    return res.status(500).send({ message: 'Error interno del servidor', error });
    }
}