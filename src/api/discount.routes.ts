import { FastifyInstance } from 'fastify';
import * as z from "zod";
import isAuth from '../middlewares/isAuth.js';
import { createDiscount, deleteDiscount, getDiscount, getDiscounts, updateDiscount } from '../controllers/discounts/discount.controller.js';
import { UploadDocumentController } from '../controllers/discounts/UploadDocumentController.js';
import { createDiscountSchema } from '../validators/discount.schema.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';

export async function discountRoutes(fastify: FastifyInstance) {
	fastify.post('/upload', {
		preHandler: [isAuth],
		schema: {
			tags: ['Descuentos'],
			description: 'Sube un documento de subsidio a Supabase Storage. Requiere autenticación.',
			summary: 'Subir documento de subsidio',
			security: [{ bearerAuth: [] }]
		}
	}, UploadDocumentController.upload);

	fastify.post('/', {
		preHandler: [isAuth],
		schema: {
			description: 'Crea una nuevas solicitud de descuento',
			summary: 'Crear solicitud de descuento',
			tags: ['Descuentos'],
			security: [{ bearerAuth: [] }],
			body: {
				...z.toJSONSchema(createDiscountSchema, {
					target: "openapi-3.0"
				})
			}
		},
	}, createDiscount);
	fastify.get('/user', {
		preHandler: [isAuth],
		schema: {
			description: 'Retorna el descuento actual del usuario',
			summary: 'Obtener descuento actual',
			tags: ['Descuentos'],
			security: [{ bearerAuth: [] }],
		},
	}, getDiscount);

	fastify.get('/', {
		preHandler: [isAuth, requireAdmin],
		schema: {
			description: 'Retorna todas las solicitudes de descuento del sistema.',
			summary: 'Listar todas las solicitudes de descuento',
			tags: ['Descuentos'],
			security: [{ bearerAuth: [] }],
		},
	}, getDiscounts);

	fastify.put('/:id', {
		preHandler: [isAuth, requireAdmin],
		schema: {
			description: 'Actualiza la solicitud de descuento del usuario',
			summary: 'Actualizar solicitud de descuento',
			tags: ['Descuentos'],
			security: [{ bearerAuth: [] }],
		},
	}, updateDiscount);

	fastify.delete('/:id', {
		preHandler: [isAuth, requireAdmin],
		schema: {
			description: 'Elimina la solicitud de descuento del usuario',
			summary: 'Eliminar solicitud de descuento',
			tags: ['Descuentos'],
			security: [{ bearerAuth: [] }],
		},
	}, deleteDiscount);
}
