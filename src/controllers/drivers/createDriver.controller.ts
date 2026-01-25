import { FastifyRequest, FastifyReply } from 'fastify';
import { createDriver, getDriverByLicenseNumber } from '../../models/driver';

interface CreateDriverBody {
    name: string
    email: string
    password: string
    licenseNumber: string
    phone: string
    status?: 'Active' | 'Inactive'
}

export async function createDriverController(request: FastifyRequest<{ Body: CreateDriverBody }>, reply: FastifyReply){
    try{
        const { name, email, password, licenseNumber, phone, status } = request.body
        
        if(!name || !email || !password || !licenseNumber || !phone){
            return reply.code(400).send({ message: 'All fields are required' })
        }

        const existingLicenseNumber = await getDriverByLicenseNumber(licenseNumber)

        if(existingLicenseNumber){
            return reply.code(409).send({ message: 'License number already registered'})
        }

        const driver = await createDriver({
            name,
            email,
            password,
            licenseNumber,
            phone,
            status: status || 'Active'
        })

        return reply.code(201).send({ success: true, data: driver })

    }catch(error){
        console.error('Error creating driver: ', error)
        return reply.code(500).send({ message: 'Error creating driver' })
    }
}