import { FastifyInstance } from 'fastify';
import * as z from "zod";
import isAuth from '../middlewares/isAuth.js';
import { createDiscount, deleteDiscount, getDiscount, getDiscounts, updateDiscount } from '../controllers/discounts/discount.controller.js';
import { UploadDocumentController } from '../controllers/discounts/UploadDocumentController.js';
import { createDiscountSchema } from '../validators/discount.schema.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';

// ── Esquemas JSON reutilizables ────────────────────────────────────────

const discountProfileSchema = {
	type: 'object',
	properties: {
		_id:                 { type: 'string', description: 'ID del perfil de descuento (ObjectId)' },
		userId:              { type: 'string', description: 'ID del pasajero solicitante' },
		discountType:        { type: 'string', enum: ['estudiante', 'discapacidad'], description: 'Tipo de descuento' },
		discountPercentage:  { type: 'number', description: 'Porcentaje de descuento (ej: 50)', example: 50 },
		status:              { type: 'string', enum: ['pendiente', 'aprobado', 'rechazado', 'expirado'], description: 'Estado de la solicitud' },
		documentType:        { type: 'string', enum: ['carnet_estudiantil', 'constancia_inscripcion', 'cedula_senior'], description: 'Tipo de documento presentado' },
		documentNumber:      { type: 'string', description: 'Número del documento' },
		documentImageUrl:    { type: 'string', format: 'uri', nullable: true, description: 'URL de la imagen del documento subido a Supabase Storage' },
		institutionName:     { type: 'string', nullable: true, description: 'Nombre de la institución (si aplica)' },
		rejectionReason:     { type: 'string', nullable: true, description: 'Motivo de rechazo (si fue rechazado)' },
		reviewedBy:          { type: 'string', nullable: true, description: 'ID del administrador que revisó' },
		reviewedAt:          { type: 'string', format: 'date-time', nullable: true, description: 'Fecha de revisión' },
		validFrom:           { type: 'string', format: 'date-time', nullable: true, description: 'Fecha de inicio de vigencia' },
		validUntil:          { type: 'string', format: 'date-time', nullable: true, description: 'Fecha de fin de vigencia' },
		createdAt:           { type: 'string', format: 'date-time' },
		updatedAt:           { type: 'string', format: 'date-time' },
	},
} as const;

const successResponseSchema = (dataSchema: object) => ({
	type: 'object',
	properties: {
		success: { type: 'boolean', example: true },
		message: { type: 'string' },
		data: dataSchema,
	},
});

const errorResponseSchema = {
	type: 'object',
	properties: {
		success: { type: 'boolean', example: false },
		message: { type: 'string', description: 'Mensaje de error' },
	},
} as const;

// ── Rutas ──────────────────────────────────────────────────────────────

export async function discountRoutes(fastify: FastifyInstance) {

	// POST /api/descuentos/upload
	fastify.post('/upload', {
		preHandler: [isAuth],
		schema: {
			tags: ['Descuentos'],
			summary: 'Subir documento de subsidio',
			description:
				'Sube un documento de subsidio (imagen o PDF) a Supabase Storage. '
				+ 'Se usa antes de crear la solicitud de descuento para obtener la URL pública del documento. '
				+ 'El archivo se almacena en la carpeta subsidios/{userId}-{timestamp}.{ext}.',
			security: [{ bearerAuth: [] }],
			consumes: ['multipart/form-data'],
			response: {
				200: {
					description: 'Documento subido exitosamente',
					type: 'object',
					properties: {
						success: { type: 'boolean', example: true },
						message: { type: 'string', example: 'Documento subido correctamente' },
						url:     { type: 'string', format: 'uri', description: 'URL pública del documento subido' },
					},
				},
				400: {
					description: 'No se proporcionó ningún archivo',
					type: 'object',
					properties: { error: { type: 'string' } },
				},
				500: {
					description: 'Error al subir el documento a Supabase',
					type: 'object',
					properties: { error: { type: 'string' } },
				},
			},
		}
	}, UploadDocumentController.upload);

	// POST /api/descuentos/
	fastify.post('/', {
		preHandler: [isAuth],
		schema: {
			tags: ['Descuentos'],
			summary: 'Crear solicitud de descuento',
			description:
				'El pasajero crea una solicitud de descuento adjuntando tipo de documento, tipo de descuento '
				+ 'y opcionalmente la URL de la imagen del documento. La solicitud queda en estado "pendiente" '
				+ 'hasta que un administrador la apruebe o rechace.',
			security: [{ bearerAuth: [] }],
			body: {
				type: 'object',
				required: ['documentType', 'discountType'],
				properties: {
					documentType:    { type: 'string', enum: ['carnet_estudiantil', 'constancia_inscripcion', 'cedula_senior'], description: 'Tipo de documento de respaldo' },
					discountType:    { type: 'string', enum: ['estudiante', 'discapacidad'], description: 'Tipo de descuento solicitado' },
					institutionName: { type: 'string', description: 'Nombre de la institución educativa (opcional)', example: 'Universidad de Panamá' },
					documentNumber:  { type: 'string', description: 'Número del documento (opcional)', example: 'EST-2026-001' },
					documentImageUrl:{ type: 'string', format: 'uri', description: 'URL de la imagen del documento (obtenida del endpoint /upload)' },
				},
			},
			response: {
				201: {
					description: 'Solicitud de descuento creada exitosamente',
					...successResponseSchema(discountProfileSchema),
				},
				400: {
					description: 'Error de validación o solicitud duplicada',
					...errorResponseSchema,
				},
			},
		},
	}, createDiscount);

	// GET /api/descuentos/user
	fastify.get('/user', {
		preHandler: [isAuth],
		schema: {
			tags: ['Descuentos'],
			summary: 'Obtener mi descuento actual',
			description:
				'Retorna el perfil de descuento actual del pasajero autenticado, '
				+ 'incluyendo el porcentaje de descuento, estado de la solicitud y fechas de vigencia.',
			security: [{ bearerAuth: [] }],
			response: {
				200: {
					description: 'Perfil de descuento del usuario',
					...successResponseSchema(discountProfileSchema),
				},
				404: {
					description: 'El usuario no tiene solicitud de descuento',
					...errorResponseSchema,
				},
			},
		},
	}, getDiscount);

	// GET /api/descuentos/
	fastify.get('/', {
		preHandler: [isAuth, requireAdmin],
		schema: {
			tags: ['Descuentos'],
			summary: 'Listar todas las solicitudes de descuento',
			description:
				'Retorna todas las solicitudes de descuento del sistema con paginación y filtros opcionales. '
				+ 'Requiere rol administrador.',
			security: [{ bearerAuth: [] }],
			querystring: {
				type: 'object',
				properties: {
					pageNumber:   { type: 'number', description: 'Número de página (default: 1)', example: 1 },
					pageSize:     { type: 'number', description: 'Resultados por página (default: 10)', example: 10 },
					status:       { type: 'string', enum: ['pendiente', 'aprobado', 'rechazado', 'expirado'], description: 'Filtrar por estado' },
					discountType: { type: 'string', enum: ['estudiante', 'discapacidad'], description: 'Filtrar por tipo de descuento' },
					documentType: { type: 'string', enum: ['carnet_estudiantil', 'constancia_inscripcion', 'cedula_senior'], description: 'Filtrar por tipo de documento' },
				},
			},
			response: {
				200: {
					description: 'Lista de solicitudes de descuento',
					...successResponseSchema({
						type: 'array',
						items: discountProfileSchema,
					}),
				},
				404: {
					description: 'No se encontraron solicitudes',
					...errorResponseSchema,
				},
			},
		},
	}, getDiscounts);

	// PUT /api/descuentos/:id
	fastify.put('/:id', {
		preHandler: [isAuth, requireAdmin],
		schema: {
			tags: ['Descuentos'],
			summary: 'Actualizar solicitud de descuento',
			description:
				'El administrador actualiza una solicitud de descuento: puede cambiar su estado '
				+ '(aprobar/rechazar), indicar motivo de rechazo, ajustar fechas de vigencia o corregir datos del documento.',
			security: [{ bearerAuth: [] }],
			params: {
				type: 'object',
				required: ['id'],
				properties: {
					id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'ID de la solicitud de descuento (ObjectId)' },
				},
			},
			body: {
				type: 'object',
				properties: {
					documentType:    { type: 'string', enum: ['carnet_estudiantil', 'constancia_inscripcion', 'cedula_senior'], description: 'Tipo de documento' },
					discountType:    { type: 'string', enum: ['estudiante', 'discapacidad'], description: 'Tipo de descuento' },
					status:          { type: 'string', enum: ['pendiente', 'aprobado', 'rechazado', 'expirado'], description: 'Nuevo estado de la solicitud' },
					rejectionReason: { type: 'string', description: 'Motivo de rechazo (requerido si status = rechazado)' },
					institutionName: { type: 'string', description: 'Nombre de la institución' },
					documentNumber:  { type: 'string', description: 'Número del documento' },
					documentImageUrl:{ type: 'string', format: 'uri', description: 'URL de la imagen del documento' },
					validFrom:       { type: 'string', format: 'date-time', description: 'Fecha de inicio de vigencia' },
					validUntil:      { type: 'string', format: 'date-time', description: 'Fecha de fin de vigencia' },
				},
			},
			response: {
				200: {
					description: 'Solicitud actualizada exitosamente',
					...successResponseSchema(discountProfileSchema),
				},
				400: {
					description: 'Error de validación',
					...errorResponseSchema,
				},
			},
		},
	}, updateDiscount);

	// DELETE /api/descuentos/:id
	fastify.delete('/:id', {
		preHandler: [isAuth, requireAdmin],
		schema: {
			tags: ['Descuentos'],
			summary: 'Eliminar solicitud de descuento',
			description: 'Elimina permanentemente una solicitud de descuento del sistema. Requiere rol administrador.',
			security: [{ bearerAuth: [] }],
			params: {
				type: 'object',
				required: ['id'],
				properties: {
					id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'ID de la solicitud de descuento (ObjectId)' },
				},
			},
			response: {
				200: {
					description: 'Solicitud eliminada exitosamente',
					...successResponseSchema(discountProfileSchema),
				},
				404: {
					description: 'Solicitud no encontrada',
					...errorResponseSchema,
				},
			},
		},
	}, deleteDiscount);
}
