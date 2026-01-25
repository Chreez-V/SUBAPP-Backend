import { FastifyInstance } from 'fastify';
import { createDriverController } from '../../controllers/drivers/createDriver.controller.js';
import { deleteDriverController } from '../../controllers/drivers/deleteDriver.controller.js';
import { getActiveDrivers } from '../../controllers/drivers/getActiveDrivers.controller.js';
import { getDriverController } from '../../controllers/drivers/getDriver.controller.js';
import { getDriversController } from '../../controllers/drivers/getDrivers.controller.js';
import { updateDriverController } from '../../controllers/drivers/updateDriver.controller.js';

export async function driversRoutes(fastify: FastifyInstance) {
    // Get all drivers
    fastify.get('/', {
        schema: {
            tags: ['Drivers'],
            description: 'Get all drivers',
            summary: 'Retrieve all drivers',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    _id: { type: 'string' },
                                    name: { type: 'string' },
                                    email: { type: 'string' },
                                    licenseNumber: { type: 'string' },
                                    phone: { type: 'string' },
                                    status: { type: 'string', enum: ['Active', 'Inactive'] },
                                    role: { type: 'string' },
                                    createdAt: { type: 'string' },
                                    updatedAt: { type: 'string' },
                                }
                            }
                        }
                    }
                }
            }
        }
    }, getDriversController);

    // Get active drivers only
    fastify.get('/active', {
        schema: {
            tags: ['Drivers'],
            description: 'Get only active drivers',
            summary: 'Retrieve active drivers',
        }
    }, getActiveDrivers);

    // Get driver by ID
    fastify.get('/:id', {
        schema: {
            tags: ['Drivers'],
            description: 'Get driver by ID',
            summary: 'Retrieve a specific driver',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Driver ID' }
                },
                required: ['id']
            }
        }
    }, getDriverController);

    // Create new driver
    fastify.post('/', {
        schema: {
            tags: ['Drivers'],
            description: 'Create a new driver',
            summary: 'Register a new driver',
            body: {
                type: 'object',
                required: ['name', 'email', 'password', 'licenseNumber', 'phone'],
                properties: {
                    name: { type: 'string', description: 'Driver full name' },
                    email: { type: 'string', format: 'email', description: 'Driver email' },
                    password: { type: 'string', minLength: 6, description: 'Driver password' },
                    licenseNumber: { type: 'string', description: 'Driver license number' },
                    phone: { type: 'string', description: 'Driver phone number' },
                    status: { type: 'string', enum: ['Active', 'Inactive'], default: 'Active' }
                }
            }
        }
    }, createDriverController);

    // Update driver
    fastify.put('/:id', {
        schema: {
            tags: ['Drivers'],
            description: 'Update driver information',
            summary: 'Update an existing driver',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Driver ID' }
                },
                required: ['id']
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    licenseNumber: { type: 'string' },
                    phone: { type: 'string' },
                    status: { type: 'string', enum: ['Active', 'Inactive'] }
                }
            }
        }
    }, updateDriverController);

    // Delete driver
    fastify.delete('/:id', {
        schema: {
            tags: ['Drivers'],
            description: 'Delete a driver permanently',
            summary: 'Remove a driver from the system',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Driver ID' }
                },
                required: ['id']
            }
        }
    }, deleteDriverController);
}