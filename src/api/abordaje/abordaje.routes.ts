import { FastifyInstance } from 'fastify';
import { requireRole } from '../../middlewares/requireRole.js';

// Importar los controladores que creaste
import { pagarNfcController } from '../../controllers/abordaje/pagarNfc.controller.js';
import { generarQrController } from '../../controllers/abordaje/generarQr.controller.js';
import { pagarQrController } from '../../controllers/abordaje/pagarQr.controller.js';
// Usa el nombre exacto que le pusiste a este archivo si tuviste que cambiarlo
import { getHistorialController } from '../../controllers/abordaje/getHistorial.controller.js'; 
import { conductorRegistroController } from '../../controllers/abordaje/conductorRegistro.controller.js';

// Importar los esquemas de validación de Zod
import { pagarNfcSchema, generarQrSchema, pagarQrSchema } from '../../validators/boarding.schema.js';
import isAuth from '../../middlewares/isAuth.js';


export async function abordajeRoutes(fastify: FastifyInstance) {

  // 1. Pago con NFC (Solo Conductor)
  fastify.post('/pagar-nfc', {
    schema: {
      ...pagarNfcSchema,
      tags: ['Abordaje'],
      summary: 'Pagar pasaje con tarjeta NFC',
      description: 'El conductor registra el cobro de un pasaje mediante la lectura de la tarjeta NFC del pasajero. Se descuenta el saldo del pasajero y se acredita al conductor.',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [isAuth, requireRole(['driver'])]
  }, pagarNfcController);

  // 2. Generar QR (Solo Conductor)
  fastify.post('/generar-qr', {
    schema: {
      ...generarQrSchema,
      tags: ['Abordaje'],
      summary: 'Generar código QR de cobro',
      description: 'El conductor genera un código QR temporal que el pasajero escanea para pagar el pasaje desde su aplicación móvil.',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [isAuth, requireRole(['driver'])]
  }, generarQrController);

  // 3. Pago con QR (Solo Pasajero)
  fastify.post('/pagar-qr', {
    schema: {
      ...pagarQrSchema,
      tags: ['Abordaje'],
      summary: 'Pagar pasaje con código QR',
      description: 'El pasajero escanea el código QR generado por el conductor y paga el pasaje desde su saldo de billetera.',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [isAuth, requireRole(['passenger'])]
  }, pagarQrController);

  // 4. Historial de viajes (Solo Pasajero)
  fastify.get('/historial', {
    schema: {
      tags: ['Abordaje'],
      summary: 'Historial de abordajes del pasajero',
      description: 'Devuelve el historial de pagos de pasaje realizados por el pasajero autenticado (NFC y QR).',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [isAuth, requireRole(['passenger'])]
  }, getHistorialController);

  // 5. Registro de cobros del turno (Solo Conductor)
  fastify.get('/conductor/registro', {
    schema: {
      tags: ['Abordaje'],
      summary: 'Registro de cobros del conductor',
      description: 'Devuelve el registro de todos los pasajes cobrados por el conductor durante su turno activo.',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [isAuth, requireRole(['driver'])]
  }, conductorRegistroController);

}