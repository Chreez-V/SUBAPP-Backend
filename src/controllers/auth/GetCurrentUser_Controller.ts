import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from '../../models/user.js';
import { Admin } from '../../models/admin.js';
import { Driver } from '../../models/driver.js';

export class GetCurrentUserController {
  static async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      // El usuario ya está autenticado por el middleware JWT
      const user = (request as any).user;

      if (!user || !user.id || !user.role) {
        return reply.status(401).send({ 
          success: false, 
          error: 'Usuario no autenticado' 
        });
      }

      let currentUser: any = null;

      // Buscar el usuario en el modelo correspondiente según su rol
      switch (user.role) {
        case 'passenger':
          currentUser = await User.findById(user.id).select('-auth.password').lean();
          break;
        case 'driver':
          currentUser = await Driver.findById(user.id).select('-auth.password').lean();
          break;
        case 'admin':
          currentUser = await Admin.findById(user.id).select('-auth.password').lean();
          break;
        default:
          return reply.status(400).send({ 
            success: false, 
            error: 'Rol de usuario no válido' 
          });
      }

      if (!currentUser) {
        return reply.status(404).send({ 
          success: false, 
          error: 'Usuario no encontrado' 
        });
      }

      return reply.status(200).send({
        success: true,
        data: {
          id: currentUser._id,
          email: currentUser.email,
          fullName: currentUser.fullName || currentUser.name,
          role: user.role,
          profilePictureUrl: currentUser.profilePictureUrl || null,
          ...(user.role === 'passenger' && { credit: currentUser.credit }),
          ...(user.role === 'driver' && { 
            licenseNumber: currentUser.licenseNumber,
            phone: currentUser.phone,
            status: currentUser.status 
          }),
          ...(user.role === 'admin' && { 
            phone: currentUser.phone,
            lastLogin: currentUser.lastLogin 
          }),
          createdAt: currentUser.createdAt,
          updatedAt: currentUser.updatedAt,
        }
      });
    } catch (error: any) {
      console.error('[GetCurrentUser] Error:', error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Error al obtener información del usuario' 
      });
    }
  }
}
