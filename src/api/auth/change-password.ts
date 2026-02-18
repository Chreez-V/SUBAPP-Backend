import { FastifyInstance } from 'fastify';
import { forgotPassword, resetPassword } from '../../controllers/auth/ChangePassword_Controller.js';
import {
  forgotPasswordJsonSchema,
  resetPasswordJsonSchema,
} from '../../validators/auth.schema.js';

async function changePasswordRoutes(fastify: FastifyInstance) {
  // QUITAMOS isAuth porque el usuario no está logueado cuando olvida su clave
  fastify.post(
    '/recuperar-contrasena',
    {
      schema: {
        tags: ['Auth'],
        description: 'Envía un código de 6 dígitos al correo del usuario para iniciar el proceso de recuperación de contraseña.',
        summary: 'Solicitar recuperación de contraseña',
        body: forgotPasswordJsonSchema,
      },
    },
    forgotPassword
  );

  fastify.post(
    '/restablecer-contrasena',
    {
      schema: {
        tags: ['Auth'],
        description: 'Valida el código de 6 dígitos recibido por correo y establece la nueva contraseña del usuario.',
        summary: 'Restablecer contraseña',
        body: resetPasswordJsonSchema,
      },
    },
    resetPassword
  );
}

export default changePasswordRoutes;