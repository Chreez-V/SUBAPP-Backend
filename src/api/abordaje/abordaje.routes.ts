import { FastifyInstance } from 'fastify';
import { requireRole } from '../../middlewares/requireRole';

// Importar los controladores que creaste
import { pagarNfcController } from '../../controllers/abordaje/pagarNfc.controller';
import { generarQrController } from '../../controllers/abordaje/generarQr.controller';
import { pagarQrController } from '../../controllers/abordaje/pagarQr.controller';
// Usa el nombre exacto que le pusiste a este archivo si tuviste que cambiarlo
import { getHistorialController } from '../../controllers/abordaje/getHistorial.controller'; 
import { conductorRegistroController } from '../../controllers/abordaje/conductorRegistro.controller';

// Importar los esquemas de validación de Zod
import { pagarNfcSchema, generarQrSchema, pagarQrSchema } from '../../validators/boarding.schema';
import isAuth from '../../middlewares/isAuth';


export async function abordajeRoutes(fastify: FastifyInstance) {
  

 // 1. Pago con NFC (Solo Conductor)
  fastify.post('/pagar-nfc', {
    schema: pagarNfcSchema,
    preHandler: [isAuth, requireRole(['driver'])] 
  }, pagarNfcController);


// 2. Generar QR (Solo Conductor)
  fastify.post('/generar-qr', {
    schema: generarQrSchema,
    preHandler: [isAuth, requireRole(['driver'])] // <-- Asegúrate de que tenga ambos
  }, generarQrController);


// 3. Pago con QR (Solo Pasajero)
  fastify.post('/pagar-qr', {
    schema: pagarQrSchema,
    preHandler: [isAuth, requireRole(['passenger'])] 
  }, pagarQrController);

  // 4. Historial de viajes (Solo Pasajero)
  fastify.get('/historial', {
    preHandler: requireRole(['passenger'])
  }, getHistorialController);

  // 5. Registro de cobros del turno (Solo Conductor)
  fastify.get('/conductor/registro', {
    preHandler: requireRole(['driver'])
  }, conductorRegistroController);

}