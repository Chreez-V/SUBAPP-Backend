import { FastifyRequest, FastifyReply } from 'fastify';
import { getDrivers } from '../../models/driver.js';

export async function getDriversController(request: FastifyRequest, reply: FastifyReply){
    try{
        const drivers = await getDrivers()

        // Return empty array instead of 404 when no drivers found
        return reply.code(200).send({ success: true, data: drivers })
    
    }catch(error){
        console.error('Error fetching drivers: ', error)
        return reply.code(500).send({ success: false, message: 'Error fetching drivers', error: error instanceof Error ? error.message : 'Unknown error' })
    }
}