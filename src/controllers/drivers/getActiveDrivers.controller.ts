import { FastifyRequest, FastifyReply } from 'fastify';
import { getDrivers } from '../../models/driver.js';

export async function getActiveDrivers(request: FastifyRequest, reply: FastifyReply){
    try{
        const activeDrivers = await getDrivers({ status: 'Active' })

        if(activeDrivers.length === 0){
            return reply.code(404).send({ message: 'No active drivers found'})
        }

        return reply.code(200).send({ success: true, data: activeDrivers });

    }catch(error){
        console.error('Error fetching active drivers: ', error)
        return reply.code(500).send({ message: 'Error fetching active drivers' })
    }
}