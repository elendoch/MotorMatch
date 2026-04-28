// config/email.js
// Configura el transportador de correos usando Nodemailer
// Los datos del servidor SMTP vienen del archivo .env

const nodemailer = require('nodemailer');
require('dotenv').config();

// Creamos el transportador con las credenciales del .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // false = TLS (puerto 587), true = SSL (puerto 465)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verificamos que el transportador esté bien configurado
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error configurando el servidor de correo:', error.message);
  } else {
    console.log('✅ Servidor de correo listo para enviar emails');
  }
});

module.exports = transporter;
