import { FastifyInstance } from "fastify";
import { ProfilePictureController } from "../../controllers/auth/ProfilePictureController.js";
import { completarPerfil } from "../../controllers/auth/completarPerfil.controller.js";
import isAuth from "../../middlewares/isAuth.js";

export async function profileRoutes(fastify: FastifyInstance) {
  fastify.post('/foto-perfil', {
    preHandler: [isAuth],
    schema: {
      tags: ['Perfil'],
      description: 'Sube una imagen de perfil a Supabase Storage y actualiza la URL en el perfil del usuario en MongoDB. Requiere autenticación.',
      summary: 'Subir foto de perfil',
      security: [{ bearerAuth: [] }]
    }
  }, ProfilePictureController.upload);

  // KYC Light — Completar perfil (cédula, fecha de nacimiento, teléfono)
  fastify.put('/completar-perfil', {
    preHandler: [isAuth],
    schema: {
      tags: ['Perfil'],
      summary: 'Completar perfil KYC',
      description: 'Actualiza los datos de identidad del usuario (cédula, fecha de nacimiento, teléfono, imagen de documento). Necesario para operar con el sistema de pagos.',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          cedula: { type: 'string', description: 'Cédula de identidad (ej: "V-12345678")' },
          birthDate: { type: 'string', format: 'date', description: 'Fecha de nacimiento (YYYY-MM-DD)' },
          phone: { type: 'string', description: 'Teléfono móvil (ej: "+58 412 1234567")' },
          idDocumentImageUrl: { type: 'string', description: 'URL de la imagen del documento de identidad' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                cedula: { type: 'string' },
                birthDate: { type: 'string' },
                phone: { type: 'string' },
                idDocumentImageUrl: { type: 'string' },
                isProfileComplete: { type: 'boolean' },
              },
            },
          },
        },
      },
    }
  }, completarPerfil);
}
