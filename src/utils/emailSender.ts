import { transporter } from '../config/mailer';

export const sendPasswordResetEmail = async (email: string, token: string) => {
  // Enlace que el usuario pinchará (ajusta la URL a tu frontend o endpoint)
  const resetUrl = `http://localhost:3500/reset-password/${token}`;

  const mailOptions = {
    from: '"Soporte" <no-reply@tuapp.com>',
    to: email,
    subject: 'Recuperación de contraseña',
    html: `
      <h1>Restablecer Contraseña</h1>
      <p>Has solicitado un cambio de contraseña. Haz clic en el siguiente enlace:</p>
      <a href="${resetUrl}" target="_blank">Cambiar mi contraseña</a>
      <p>Si no fuiste tú, ignora este correo.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error enviando correo:", error);
    return false;
  }
};