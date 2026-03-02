import Fastify from "fastify";
import { envs } from "./env.config.js";
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';
import { routes } from "../api/index.js";
import jwtPlugin from "./jwt.js";
import fastifyMultipart from '@fastify/multipart';

export async function app() {
  const server = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
      }
    },
    ajv: {
      customOptions: {
        // Allow OpenAPI/Swagger keywords that AJV strict mode rejects
        keywords: ['example'],
      },
    },
  });

  // ✅ Multipart Configuration
  await server.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

  // ✅ CORS Configuration
  await server.register(fastifyCors, {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://subapp-api.onrender.com',
      'https://suba-admin-panel.vercel.app',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const swaggerServerUrl = isProduction
    ? 'https://subapp-api.onrender.com/'
    : `http://localhost:${envs.PORT || 3500}`;

  await server.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'SUBA API — Sistema Urbano de Buses y Administración',
        version: '1.0.0',
        description: 'API RESTful del Sistema Urbano de Buses y Administración (SUBA). Incluye módulos de autenticación, billetera digital, tarjetas NFC, abordaje, pasajes, conductores, colectores, autobuses, descuentos, reportes y soporte.',
      },
      tags: [
        { name: 'Auth', description: 'Autenticación de usuarios (login, registro, logout, recuperación de contraseña)' },
        { name: 'Perfil', description: 'Gestión del perfil del usuario (foto, KYC, datos personales)' },
        { name: 'Admin', description: 'Gestión de administradores del sistema' },
        { name: 'Admin Auth', description: 'Autenticación de administradores' },
        { name: 'Billetera', description: 'Billetera digital: saldo, recargas, transferencias, retiros e historial de transacciones' },
        { name: 'Abordaje', description: 'Módulo de abordaje: pago de pasaje con NFC, código QR e historial de cobros' },
        { name: 'Tarjetas NFC', description: 'Gestión de tarjetas NFC: solicitud, pago, vinculación, bloqueo y administración' },
        { name: 'Autobuses', description: 'Registro y gestión de autobuses de la flota' },
        { name: 'Conductores', description: 'Gestión de conductores: CRUD y asignaciones' },
        { name: 'Colectores', description: 'Gestión de colectores de pasajes en autobuses' },
        { name: 'Pasaje', description: 'Configuración de tarifas de pasaje (bus fare)' },
        { name: 'Rutas', description: 'Gestión de rutas de transporte' },
        { name: 'Paradas', description: 'Gestión de paradas de autobuses' },
        { name: 'Conjuntos', description: 'Conjuntos de rutas agrupadas' },
        { name: 'Viajes', description: 'Registro y seguimiento de viajes activos' },
        { name: 'Pasajeros', description: 'Consulta y gestión de pasajeros registrados' },
        { name: 'Descuentos', description: 'Solicitudes de descuento para estudiantes y adultos mayores' },
        { name: 'Reportes', description: 'Reportes e incidencias del sistema de transporte' },
        { name: 'Soporte', description: 'Gestión de agentes de soporte técnico' },
        { name: 'Healthcheck', description: 'Verificación del estado del servidor' },
        { name: 'Database', description: 'Verificación de conectividad con la base de datos' },
      ],
      servers: [{
        url: swaggerServerUrl,
        description: isProduction ? 'production' : 'local'
      }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list' as const,
      deepLinking: false
    },
    staticCSP: true,
    transformSpecificationClone: true
  });
 
  await server.register(jwtPlugin); 
  await server.register(routes);

  return server;
}
