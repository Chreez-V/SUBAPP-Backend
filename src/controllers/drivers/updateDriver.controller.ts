import { FastifyRequest, FastifyReply } from 'fastify';
import { updateDriver, getDriverById } from '../../models/driver';

interface UpdateDriverParams {
    id: string
}

interface UpdateDriverBody {
    nombre?: string
    numeroLicencia?: string
    password?: string
    telefono?: string
    estado?: 'Activo' | 'Inactivo'
}

export async function updateDriverController(request: FastifyRequest<{ Params: UpdateDriverParams; Body: UpdateDriverBody }>, reply: FastifyReply){
    try{
        const { id } = request.params
        const existingDriver = await getDriverById(id)

        if(!existingDriver){
            return reply.code(404).send({ message: 'Conductor no encontrado'})
        }

        const driverDataUpdated = request.body
        const driverUpdated = await updateDriver(id, driverDataUpdated)

        return reply.code(201).send(driverUpdated)

    }catch(error){
        console.error('Error intentando actualizar al conductor: ', error)
        return reply.code(500).send({ message: 'Error al intentar actualizar al conductor' })
    }
}