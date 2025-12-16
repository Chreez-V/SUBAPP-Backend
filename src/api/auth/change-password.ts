import { FastifyInstance } from 'fastify';
import { forgotPassword, resetPassword } from '../../controllers/auth/ChangePassword_Controller';
import {
  forgotPasswordJsonSchema,
  resetPasswordJsonSchema,
} from '../../validators/auth.schema';
import isAuth from '../../middlewares/isAuth';

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