import { FastifyReply, FastifyRequest } from 'fastify';
import { User } from '../../models/user.js'; 
import { ForgotPasswordInput, ResetPasswordInput } from '../../validators/auth.schema.js';

// --- Paso 1: Solicitar código ---
export const forgotPassword = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email } = request.body as ForgotPasswordInput;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      // Por seguridad, respondemos 200 para no dar pistas de qué correos existen
      return reply.code(200).send({ message: 'Si el correo existe, se enviará un código.' });
    }

    // Generar código de 6 dígitos (igual que en tu front)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // El código expira en 15 min

    // Guardar en la base de datos
    user.resetPasswordToken = code; 
    user.resetPasswordExpires = expires;
    await user.save();

    // IMPORTANTE: Ahora el Back le devuelve el código al Front 
    // para que el Front lo envíe por EmailJS (si decides hacerlo así)
    return reply.code(200).send({ 
      message: 'Código generado', 
      code: code // <-- El front recibirá esto para mandarlo por EmailJS
    });

  } catch (error) {
    return reply.code(500).send({ error: 'Error interno' });
  }
};

// --- Paso 2: Validar código y cambiar clave ---
export const resetPassword = async (request: FastifyRequest, reply: FastifyReply) => {
  // Agregamos 'email' al body para buscar al usuario correctamente
  const { email, token, newPassword } = request.body as any; 

  try {
    const user = await User.findOne({
      email: email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+auth.password'); 

    if (!user) {
      return reply.code(400).send({ error: 'Código inválido o expirado' });
    }

    // Actualizar contraseña
    user.auth.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return reply.code(200).send({ message: 'Contraseña actualizada con éxito' });

  } catch (error) {
    return reply.code(500).send({ error: 'Error al cambiar contraseña' });
  }
};