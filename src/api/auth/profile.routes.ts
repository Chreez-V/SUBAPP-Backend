import { FastifyInstance } from "fastify";
import { ProfilePictureController } from "../../controllers/auth/ProfilePictureController.js";
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
}
