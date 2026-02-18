import { FastifyInstance } from 'fastify';
import { createDriverController } from '../../controllers/drivers/createDriver.controller.js';
import { deleteDriverController } from '../../controllers/drivers/deleteDriver.controller.js';
import { getActiveDrivers } from '../../controllers/drivers/getActiveDrivers.controller.js';
import { getDriverController } from '../../controllers/drivers/getDriver.controller.js';
import { getDriversController } from '../../controllers/drivers/getDrivers.controller.js';
import { updateDriverController } from '../../controllers/drivers/updateDriver.controller.js';

export async function driversRoutes(fastify: FastifyInstance) {
    // Get all drivers
    fastify.get('/listar', {
        schema: {
            tags: ['Conductores'],
            description: 'Retorna la lista completa de todos los conductores registrados en el sistema, incluyendo activos e inactivos.',
            summary: 'Listar todos los conductores',
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
    fastify.get('/activos', {
        schema: {
            tags: ['Conductores'],
            description: 'Retorna únicamente los conductores con estado "Active" disponibles para asignación de viajes.',
            summary: 'Listar conductores activos',
        }
    }, getActiveDrivers);

    // Get driver by ID
    fastify.get('/buscar/:id', {
        schema: {
            tags: ['Conductores'],
            description: 'Retorna los datos completos de un conductor específico buscado por su ID de MongoDB.',
            summary: 'Obtener conductor por ID',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'ID del conductor (MongoDB ObjectId)' }
                },
                required: ['id']
            }
        }
    }, getDriverController);

    // Create new driver
    fastify.post('/crear', {
        schema: {
            tags: ['Conductores'],
            description: 'Registra un nuevo conductor en el sistema con sus datos personales y número de licencia.',
            summary: 'Crear conductor',
            body: {
                type: 'object',
                required: ['name', 'email', 'password', 'licenseNumber', 'phone'],
                properties: {
                    name: { type: 'string', description: 'Nombre completo del conductor' },
                    email: { type: 'string', format: 'email', description: 'Correo electrónico del conductor' },
                    password: { type: 'string', minLength: 6, description: 'Contraseña (mínimo 6 caracteres)' },
                    licenseNumber: { type: 'string', description: 'Número de licencia de conducir' },
                    phone: { type: 'string', description: 'Número de teléfono del conductor' },
                    status: { type: 'string', enum: ['Active', 'Inactive'], default: 'Active', description: 'Estado inicial del conductor' }
                }
            }
        }
    }, createDriverController);

    // Update driver
    fastify.put('/actualizar/:id', {
        schema: {
            tags: ['Conductores'],
            description: 'Actualiza los datos de un conductor existente. Solo se modifican los campos enviados en el cuerpo de la petición.',
            summary: 'Actualizar conductor',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'ID del conductor (MongoDB ObjectId)' }
                },
                required: ['id']
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Nuevo nombre del conductor' },
                    email: { type: 'string', format: 'email', description: 'Nuevo correo electrónico' },
                    licenseNumber: { type: 'string', description: 'Nuevo número de licencia' },
                    phone: { type: 'string', description: 'Nuevo teléfono' },
                    status: { type: 'string', enum: ['Active', 'Inactive'], description: 'Nuevo estado del conductor' }
                }
            }
        }
    }, updateDriverController);

    // Delete driver
    fastify.delete('/eliminar/:id', {
        schema: {
            tags: ['Conductores'],
            description: 'Elimina permanentemente un conductor del sistema por su ID. Esta acción no puede deshacerse.',
            summary: 'Eliminar conductor',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'ID del conductor (MongoDB ObjectId)' }
                },
                required: ['id']
            }
        }
    }, deleteDriverController);
}