import { requireRole } from './requireRole.js';

/**
 * Middleware para verificar que el usuario autenticado tenga rol de administrador
 * Ahora utiliza el patrón genérico de requireRole
 */
export default requireRole(['admin']);
