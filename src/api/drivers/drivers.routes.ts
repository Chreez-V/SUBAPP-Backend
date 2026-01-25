import { FastifyInstance } from 'fastify';
import { createDriverController } from '@/controllers/drivers/createDriver.controller';
import { deleteDriverController } from '@/controllers/drivers/deleteDriver.controller';
import { getActiveDrivers } from '@/controllers/drivers/getActiveDrivers.controller';
import { getDriverController } from '@/controllers/drivers/getDriver.controller';
import { getDriversController } from '@/controllers/drivers/getDrivers.controller';
import { updateDriverController } from '@/controllers/drivers/updateDriver.controller';

export async function driversRoutes(fastify: FastifyInstance){
    fastify.get('/', getDriversController)
    fastify.get('/active', getActiveDrivers)
    fastify.get('/:id', getDriverController)
    fastify.post('/', createDriverController)
    fastify.put('/:id', updateDriverController)
    fastify.delete('/:id', deleteDriverController)
}