import { sgMail } from '../config/mailer.js';

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `http://localhost:3500/reset-password/${token}`;

  const msg = {
    to: email,
    from: 'subappve@gmail.com', // change to a verified sender in SendGrid
    subject: 'Recuperación de contraseña',
    text: `Has solicitado un cambio de contraseña. Visita el siguiente enlace para cambiar tu contraseña: ${resetUrl}`,
    html: `
      <h1>Restablecer Contraseña</h1>
      <p>Has solicitado un cambio de contraseña. Haz clic en el siguiente enlace:</p>
      <a href="${resetUrl}" target="_blank">Cambiar mi contraseña</a>
      <p>Si no fuiste tú, ignora este correo.</p>
    `,
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error enviando correo con SendGrid:', error);
    return false;
  }
};