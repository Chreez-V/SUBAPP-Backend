import { FastifyInstance } from 'fastify';
import { forgotPassword, resetPassword } from '../../controllers/auth/ChangePassword_Controller.js';
import {
  forgotPasswordJsonSchema,
  resetPasswordJsonSchema,
} from '../../validators/auth.schema.js';

async function changePasswordRoutes(fastify: FastifyInstance) {
  // QUITAMOS isAuth porque el usuario no está logueado cuando olvida su clave
  fastify.post(
    '/forgot-password',
    {
      schema: {
        tags: ['Auth'],
        description: 'Generar código de 6 dígitos y guardar en BD',
        body: forgotPasswordJsonSchema,
      },
    },
    forgotPassword
  );

  fastify.post(
    '/reset-password',
    {
      schema: {
        tags: ['Auth'],
        description: 'Validar código y cambiar la contraseña',
        body: resetPasswordJsonSchema,
      },
    },
    resetPassword
  );
}

export default changePasswordRoutes;