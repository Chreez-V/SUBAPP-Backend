import { FastifyReply, FastifyRequest } from 'fastify';
import { User } from '../../models/user.js';

interface DeleteUserBody {
  email: string;
}

export async function deleteUserController(
  request: FastifyRequest<{ Body: DeleteUserBody }>,
  reply: FastifyReply
) {
  const { email } = request.body;

  if (!email) {
    return reply.status(400).send({ message: 'El correo electrónico es requerido.' });
  }

  try {
    const deleted = await User.findOneAndDelete({ email });

    if (!deleted) {
      return reply.status(404).send({ message: 'Usuario no encontrado.' });
    }

    return reply.status(200).send({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return reply.status(500).send({ message: 'Error interno del servidor.' });
  }
}
