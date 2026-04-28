// controllers/authController.js
// Contiene la lógica de negocio para autenticación:
// - Registro de usuario
// - Inicio de sesión
// - Recuperación de contraseña

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const transporter = require('../config/email');
require('dotenv').config();

// ============================================================
// REGISTRAR USUARIO
// POST /api/auth/register
// ============================================================
const register = async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  // Validación básica de campos requeridos
  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    // 1. Verificamos si ya existe un usuario con ese correo
    const usuarioExistente = await pool.query(
      'SELECT id FROM usuarios WHERE correo = $1',
      [correo.toLowerCase()]
    );

    if (usuarioExistente.rows.length > 0) {
      // El correo ya está registrado → impedimos el registro
      return res.status(409).json({ message: 'Ya existe una cuenta con ese correo electrónico.' });
    }

    // 2. Encriptamos la contraseña con bcrypt
    // El número 12 es el "salt rounds": más alto = más seguro pero más lento
    const salt = await bcrypt.genSalt(12);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);

    // 3. Insertamos el usuario en la base de datos
    const nuevoUsuario = await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, correo, created_at`,
      [nombre.trim(), correo.toLowerCase(), contrasenaHash]
    );

    const usuario = nuevoUsuario.rows[0];

    // 4. Generamos el JWT para que el usuario quede autenticado al registrarse
    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // El token dura 7 días
    );

    return res.status(201).json({
      message: 'Cuenta creada exitosamente.',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// ============================================================
// INICIAR SESIÓN
// POST /api/auth/login
// ============================================================
const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
  }

  try {
    // 1. Buscamos al usuario por correo
    const resultado = await pool.query(
      'SELECT id, nombre, correo, contrasena FROM usuarios WHERE correo = $1',
      [correo.toLowerCase()]
    );

    if (resultado.rows.length === 0) {
      // El correo no existe → avisamos al usuario
      return res.status(404).json({ message: 'No existe ninguna cuenta con ese correo electrónico.' });
    }

    const usuario = resultado.rows[0];

    // 2. Comparamos la contraseña ingresada con el hash guardado
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    // 3. Generamos el JWT de sesión
    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// ============================================================
// RECUPERAR CONTRASEÑA (envío de correo)
// POST /api/auth/forgot-password
// ============================================================
const forgotPassword = async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ message: 'El correo es obligatorio.' });
  }

  try {
    // Verificamos si el correo existe en el sistema
    const resultado = await pool.query(
      'SELECT id, nombre FROM usuarios WHERE correo = $1',
      [correo.toLowerCase()]
    );

    // Por seguridad, respondemos lo mismo aunque el correo no exista
    // (para no revelar qué correos están registrados)
    if (resultado.rows.length === 0) {
      return res.status(200).json({
        message: 'Si ese correo está registrado, recibirás un email con instrucciones.'
      });
    }

    const usuario = resultado.rows[0];

    // Enviamos el correo de recuperación
    // Por ahora el contenido es básico; se puede mejorar después
    await transporter.sendMail({
      from: `"MotorMatch" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: 'Recuperación de contraseña - MotorMatch',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">MotorMatch - Recuperar Contraseña</h2>
          <p>Hola <strong>${usuario.nombre}</strong>,</p>
          <p>Recibimos una solicitud para recuperar la contraseña de tu cuenta.</p>
          <p>
            Este es un correo de prueba. Próximamente incluiremos el enlace 
            de recuperación aquí.
          </p>
          <p>Si no solicitaste esto, ignora este correo.</p>
          <br/>
          <p>El equipo de MotorMatch</p>
        </div>
      `
    });

    return res.status(200).json({
      message: 'Si ese correo está registrado, recibirás un email con instrucciones.'
    });

  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    return res.status(500).json({ message: 'Error al enviar el correo. Intenta de nuevo.' });
  }
};

module.exports = { register, login, forgotPassword };
