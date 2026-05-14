// routes/authRoutes.js
// Define las rutas de la API relacionadas con autenticación
// Cada ruta llama al controlador correspondiente

const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

// POST /api/auth/register  → Registrar nuevo usuario
router.post('/register', register);

// POST /api/auth/login     → Iniciar sesión
router.post('/login', login);

// POST /api/auth/forgot-password → Enviar correo de recuperación
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password → Restablecer contraseña con token
router.post('/reset-password', resetPassword);

module.exports = router;
