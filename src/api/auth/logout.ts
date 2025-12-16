import { FastifyInstance } from 'fastify';
import { logoutController } from '../../controllers/controlador_logout'; 
import isAuth from '../../middlewares/isAuth';

export default async function logoutRoute(fastify: FastifyInstance) {
    
    fastify.post('/logout', {
        preHandler: [isAuth]
    }, logoutController);
}