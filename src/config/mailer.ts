import nodemailer from 'nodemailer';

// Idealmente, estas credenciales deben venir de process.env
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // O tu proveedor de correo
  port: 465,
  secure: true, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER || "tu_correo@gmail.com",
    pass: process.env.SMTP_PASS || "tu_contraseña_de_aplicacion",
  },
});

transporter.verify().then(() => {
  console.log('Listo para enviar correos');
});