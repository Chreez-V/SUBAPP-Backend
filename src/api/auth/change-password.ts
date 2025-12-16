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
        body: resetPasswordJsonSchema,    
      },
        preHandler: [isAuth],
    },
    resetPassword
  );
}

export default changePasswordRoutes;