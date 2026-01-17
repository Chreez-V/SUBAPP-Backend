import { FastifyInstance } from 'fastify';
import { forgotPassword, resetPassword } from '../../controllers/auth/ChangePassword_Controller.js';
import {
  forgotPasswordJsonSchema,
  resetPasswordJsonSchema,
} from '../../validators/auth.schema.js';
import isAuth from '../../middlewares/isAuth.js';

async function changePasswordRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/forgot-password',
    {
      schema: {
        tags: ['Auth'],
        description: 'Solicitar enlace para restablecer contraseña',
        body: forgotPasswordJsonSchema,
      },
      preHandler: [isAuth],
    },
    forgotPassword
  );

  fastify.post(
    '/reset-password',
    {
      schema: {
        tags: ['Auth'],
        description: 'Restablecer contraseña usando token recibido por correo',
        body: resetPasswordJsonSchema,
      },
      preHandler: [isAuth],
    },
    resetPassword
  );
}

export default changePasswordRoutes;