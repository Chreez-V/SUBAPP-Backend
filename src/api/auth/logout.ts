import { FastifyInstance } from 'fastify';
import { logoutController } from '../../controllers/auth/Logout_Controller.js'; 
import isAuth from '../../middlewares/isAuth.js';

export default async function logoutRoute(fastify: FastifyInstance) {
    
    fastify.post('/logout', {
        preHandler: [isAuth]
    }, logoutController);
}