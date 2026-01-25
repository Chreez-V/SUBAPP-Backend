import { FastifyRequest, FastifyReply } from 'fastify';
import { updateDriver, getDriverById } from '../../models/driver.js';


interface UpdateDriverParams {
    id: string
}

interface UpdateDriverBody {
    name?: string
    email?: string
    licenseNumber?: string
    phone?: string
    status?: 'Active' | 'Inactive'
}

export async function updateDriverController(request: FastifyRequest<{ Params: UpdateDriverParams; Body: UpdateDriverBody }>, reply: FastifyReply){
    try{
        const { id } = request.params
        const existingDriver = await getDriverById(id)

        if(!existingDriver){
            return reply.code(404).send({ message: 'Driver not found'})
        }

        const driverDataUpdated = request.body
        const driverUpdated = await updateDriver(id, driverDataUpdated)

        return reply.code(200).send({ success: true, data: driverUpdated })

    }catch(error){
        console.error('Error updating driver: ', error)
        return reply.code(500).send({ message: 'Error updating driver' })
    }
}