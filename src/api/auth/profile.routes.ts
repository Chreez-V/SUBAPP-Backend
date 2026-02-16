import { FastifyInstance } from "fastify";
import { ProfilePictureController } from "../../controllers/auth/ProfilePictureController.js";
import isAuth from "../../middlewares/isAuth.js";

export async function profileRoutes(fastify: FastifyInstance) {
  fastify.post('/profile-picture', {
    preHandler: [isAuth],
    schema: {
      tags: ['Profile'],
      description: 'Sube una foto de perfil a Supabase y guarda la URL en Mongo',
      security: [{ bearerAuth: [] }]
    }
  }, ProfilePictureController.upload);
}
