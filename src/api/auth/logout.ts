import { FastifyInstance } from 'fastify';
import { logoutController } from '../../controllers/auth/Logout_Controller'; 
import isAuth from '../../middlewares/isAuth';

export default async function logoutRoute(fastify: FastifyInstance) {
    
    fastify.post('/logout', {
        preHandler: [isAuth]
    }, logoutController);
}