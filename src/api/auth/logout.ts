import { FastifyInstance } from 'fastify';
import { logoutController } from '../../controllers/controlador_logout'; 

export default async function logoutRoute(fastify: FastifyInstance) {
    
    fastify.post('/logout', logoutController); 
}