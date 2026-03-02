import { FastifyInstance } from 'fastify';
import { GetCurrentUserController } from '../../controllers/auth/GetCurrentUser_Controller.js';
import { createJwtMiddleware } from '../../middlewares/authMiddleware.js';

export async function currentUserRoute(fastify: FastifyInstance) {
  const authenticate = createJwtMiddleware(fastify);

  fastify.get('/me', {
    preHandler: authenticate,
    schema: {
      tags: ['Auth'],
      summary: 'Obtener usuario autenticado',
      description: `Retorna el perfil completo del usuario autenticado a partir de su token JWT.

Los campos devueltos varían según el **rol** del usuario:

| Campo | Roles |
|---|---|
| \`id\`, \`email\`, \`fullName\`, \`role\`, \`profilePictureUrl\`, \`createdAt\`, \`updatedAt\` | Todos |
| \`credit\` | \`passenger\` |
| \`cedula\` | \`passenger\` |
| \`birthDate\` | \`passenger\` |
| \`phone\` | \`passenger\`, \`driver\`, \`admin\`, \`support\` |
| \`idDocumentImageUrl\` | \`passenger\` |
| \`isProfileComplete\` | \`passenger\` — \`true\` cuando cédula + birthDate + phone están registrados |
| \`licenseNumber\`, \`status\` | \`driver\` |
| \`lastLogin\` | \`admin\` |
| \`department\`, \`level\`, \`status\` | \`support\` |`,
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Perfil del usuario autenticado',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              description: 'Datos del usuario. Los campos opcionales dependen del rol.',
              required: ['id', 'email', 'fullName', 'role', 'createdAt', 'updatedAt'],
              properties: {
                // ── Campos comunes a todos los roles ──────────────────────
                id: {
                  type: 'string',
                  description: 'ID único del usuario en MongoDB',
                  example: '64f1a2b3c4d5e6f7a8b9c0d1',
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'Correo electrónico del usuario',
                  example: 'usuario@ejemplo.com',
                },
                fullName: {
                  type: 'string',
                  description: 'Nombre completo del usuario',
                  example: 'Juan Pérez',
                },
                role: {
                  type: 'string',
                  enum: ['passenger', 'driver', 'admin', 'support'],
                  description: 'Rol del usuario en el sistema',
                  example: 'passenger',
                },
                profilePictureUrl: {
                  type: 'string',
                  nullable: true,
                  description: 'URL de la foto de perfil almacenada en Supabase Storage. Puede ser null.',
                  example: 'https://xxx.supabase.co/storage/v1/object/public/avatars/foto.jpg',
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Fecha de creación de la cuenta',
                  example: '2025-01-15T10:30:00.000Z',
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Fecha de última actualización del perfil',
                  example: '2025-06-20T14:00:00.000Z',
                },

                // ── Solo passenger ────────────────────────────────────────
                credit: {
                  type: 'number',
                  description: '[passenger] Saldo disponible en la billetera virtual (VES)',
                  example: 45.5,
                },
                isProfileComplete: {
                  type: 'boolean',
                  description: '[passenger] Indica si el perfil KYC está completo (cédula + birthDate + phone). Usar para mostrar pantalla de completar perfil o el home normal.',
                  example: false,
                },
                cedula: {
                  type: 'string',
                  nullable: true,
                  description: '[passenger] Cédula de identidad venezolana. Null si no se ha completado el perfil.',
                  example: 'V-12345678',
                },
                birthDate: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                  description: '[passenger] Fecha de nacimiento. Null si no se ha completado el perfil.',
                  example: '1995-08-22T00:00:00.000Z',
                },
                idDocumentImageUrl: {
                  type: 'string',
                  nullable: true,
                  description: '[passenger] URL del scan/foto del documento de identidad. Null si no fue subido.',
                  example: 'https://xxx.supabase.co/storage/v1/object/public/docs/cedula.jpg',
                },

                // ── Compartido passenger/driver/admin/support ─────────────
                phone: {
                  type: 'string',
                  nullable: true,
                  description: '[passenger, driver, admin, support] Número de teléfono móvil. Null si no está registrado.',
                  example: '+58 412 1234567',
                },

                // ── Solo driver ───────────────────────────────────────────
                licenseNumber: {
                  type: 'string',
                  description: '[driver] Número de licencia de conducir',
                  example: 'LC-0012345',
                },
                status: {
                  type: 'string',
                  description: '[driver, support] Estado de la cuenta (Active / Inactive)',
                  example: 'Active',
                },

                // ── Solo admin ────────────────────────────────────────────
                lastLogin: {
                  type: 'string',
                  format: 'date-time',
                  description: '[admin] Fecha y hora del último inicio de sesión',
                  example: '2026-03-01T08:00:00.000Z',
                },

                // ── Solo support ──────────────────────────────────────────
                department: {
                  type: 'string',
                  description: '[support] Departamento del agente de soporte',
                  example: 'Operaciones',
                },
                level: {
                  type: 'string',
                  description: '[support] Nivel de soporte (1, 2, 3)',
                  example: '2',
                },
              },
            },
          },
        },
        401: {
          description: 'Token JWT ausente, inválido o expirado',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Usuario no autenticado' },
          },
        },
        404: {
          description: 'El usuario del token ya no existe en la base de datos',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Usuario no encontrado' },
          },
        },
        500: {
          description: 'Error interno del servidor',
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error al obtener información del usuario' },
          },
        },
      },
    },
  }, GetCurrentUserController.getCurrentUser);
}
