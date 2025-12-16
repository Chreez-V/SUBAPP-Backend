import { FastifyReply, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid'; // Para generar un token único
import bcrypt from 'bcryptjs';
// 💡 CORRECCIÓN 1 & 2: Cambiado a Named Import ({ User }) y corregida la ruta a minúsculas ('../models/user')
import { User } from '../../models/user.js'; 
import { sendPasswordResetEmail } from '../../utils/emailSender.js';
import { ForgotPasswordInput, ResetPasswordInput } from '../../validators/auth.schema.js';

// --- Paso 1: Solicitar cambio de contraseña ---
export const forgotPassword = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { email } = request.body as ForgotPasswordInput;

  try {
    // Para que Mongoose pueda buscar el usuario por email
    // Usamos findUserByEmail de tu modelo si lo tuvieras, o directamente User.findOne
    const user = await User.findOne({ email });
    
    if (!user) {
      // Por seguridad, no decimos si el usuario existe o no, pero retornamos éxito
      return reply.code(200).send({ message: 'Si el correo existe, se enviará un enlace.' });
    }

    // Generar token y expiración (1 hora)
    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Guardar en base de datos (Estos campos están a nivel raíz del modelo, por lo que el acceso es directo)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // Enviar correo
    await sendPasswordResetEmail(user.email, token);

    return reply.code(200).send({ message: 'Correo enviado correctamente' });

  } catch (error) {
    console.error('Error en forgotPassword:', error);
    return reply.code(500).send({ error: 'Error interno del servidor' });
  }
};

// --- Paso 2: Crear la nueva contraseña ---
export const resetPassword = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { token, newPassword } = request.body as ResetPasswordInput;

  try {
    // Buscar usuario por token y verificar que no haya expirado ($gt = greater than)
    // El método findUserByEmail en tu modelo tiene .select('+auth.password'), así que lo usamos
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+auth.password'); // Aseguramos que se cargue la contraseña

    if (!user) {
      return reply.code(400).send({ error: 'Token inválido o expirado' });
    }


    // 💡 CORRECCIÓN 3: La contraseña está anidada en 'auth'
    user.auth.password = newPassword;

    // Limpiar el token para que no se pueda reusar
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return reply.code(200).send({ message: 'Contraseña actualizada con éxito' });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    return reply.code(500).send({ error: 'Error al cambiar contraseña' });
  }
};