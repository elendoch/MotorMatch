// controllers/authController.js
// Contiene la lógica de negocio para autenticación:
// - Registro de usuario
// - Inicio de sesión
// - Recuperación de contraseña
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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
  const { correo, contrasena, recordarme } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
  }

  try {
    // 1. Buscamos al usuario por correo
    const resultado = await pool.query(
      'SELECT id, nombre, correo, contrasena, intentos_fallidos, bloqueado_hasta FROM usuarios WHERE correo = $1',
      [correo.toLowerCase()]
    );

    if (resultado.rows.length === 0) {
      // El correo no existe → avisamos al usuario
      return res.status(404).json({ message: 'No existe ninguna cuenta con ese correo electrónico.' });
    }

    const usuario = resultado.rows[0];

    // Verificar si está bloqueado
    if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
      // Renovar bloqueo (reiniciar contador de 30 minutos)
      await pool.query(
        "UPDATE usuarios SET bloqueado_hasta = NOW() + interval '30 minutes' WHERE id = $1",
        [usuario.id]
      );
      return res.status(403).json({ message: 'Tu cuenta ha sido bloqueada temporalmente por demasiados intentos fallidos. Intenta nuevamente en 30 minutos.' });
    }

    // 2. Comparamos la contraseña ingresada con el hash guardado
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
      const nuevosIntentos = (usuario.intentos_fallidos || 0) + 1;
      
      if (nuevosIntentos >= 5) {
        await pool.query(
          "UPDATE usuarios SET intentos_fallidos = $1, bloqueado_hasta = NOW() + interval '30 minutes' WHERE id = $2",
          [nuevosIntentos, usuario.id]
        );
        return res.status(403).json({ message: 'Demasiados intentos fallidos. Tu cuenta ha sido bloqueada por 30 minutos.' });
      } else {
        await pool.query(
          "UPDATE usuarios SET intentos_fallidos = $1 WHERE id = $2",
          [nuevosIntentos, usuario.id]
        );
        return res.status(401).json({ message: `Contraseña incorrecta. Te quedan ${5 - nuevosIntentos} intentos.` });
      }
    }

    // Reseteamos los intentos fallidos al tener éxito
    await pool.query(
      "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = $1",
      [usuario.id]
    );

    // 3. Generamos el JWT de sesión
    const expiresIn = recordarme ? '30d' : '1d';
    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn }
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

    // Generar token único y temporal
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Guardar token y expiración (10 minutos)
    await pool.query(
      "UPDATE usuarios SET reset_token = $1, reset_token_expires = NOW() + interval '10 minutes' WHERE id = $2",
      [resetToken, usuario.id]
    );

    // Obtener URL del frontend, usando localhost por defecto en desarrollo
    const frontendUrls = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173'];
    const resetUrl = `${frontendUrls[0]}/reset-password?token=${resetToken}`;

    // Enviamos el correo de recuperación
    await transporter.sendMail({
      from: `"MotorMatch" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: 'Recuperación de contraseña - MotorMatch',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">MotorMatch - Recuperar Contraseña</h2>
          <p>Hola <strong>${usuario.nombre}</strong>,</p>
          <p>Recibimos una solicitud para recuperar la contraseña de tu cuenta.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña. Este enlace caducará en 10 minutos:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
          </div>
          <p>Si no solicitaste esto, ignora este correo y tu contraseña seguirá siendo la misma.</p>
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

// ============================================================
// RESTABLECER CONTRASEÑA
// POST /api/auth/reset-password
// ============================================================
const resetPassword = async (req, res) => {
  const { token, contrasena } = req.body;

  if (!token || !contrasena) {
    return res.status(400).json({ message: 'Token y contraseña son obligatorios.' });
  }

  if (contrasena.length < 8) {
    return res.status(400).json({ message: 'La contraseña debe tener mínimo 8 caracteres.' });
  }

  try {
    // 1. Buscar usuario por token y verificar expiración
    const resultado = await pool.query(
      'SELECT id, nombre, correo, contrasena FROM usuarios WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );

    if (resultado.rows.length === 0) {
      return res.status(400).json({ message: 'El enlace es inválido o ha expirado.' });
    }

    const usuario = resultado.rows[0];

    // 2. Verificar que la nueva contraseña no sea igual a la anterior
    const esMismaContrasena = await bcrypt.compare(contrasena, usuario.contrasena);
    if (esMismaContrasena) {
      return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la anterior.' });
    }

    // 3. Hashear nueva contraseña
    const salt = await bcrypt.genSalt(12);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);

    // 4. Actualizar en DB e invalidar token y resetear bloqueos
    await pool.query(
      'UPDATE usuarios SET contrasena = $1, reset_token = NULL, reset_token_expires = NULL, intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = $2',
      [contrasenaHash, usuario.id]
    );

    // 5. Enviar correo notificando el cambio exitoso
    await transporter.sendMail({
      from: `"MotorMatch" <${process.env.EMAIL_USER}>`,
      to: usuario.correo,
      subject: 'Cambio de contraseña exitoso - MotorMatch',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">MotorMatch - Contraseña Actualizada</h2>
          <p>Hola <strong>${usuario.nombre}</strong>,</p>
          <p>Te confirmamos que la contraseña de tu cuenta ha sido actualizada exitosamente.</p>
          <p>Si tú no realizaste este cambio, por favor contáctanos de inmediato.</p>
          <br/>
          <p>El equipo de MotorMatch</p>
        </div>
      `
    });

    return res.status(200).json({ message: 'Contraseña restablecida correctamente.' });
  } catch (error) {
    console.error('Error en restablecimiento de contraseña:', error);
    return res.status(500).json({ message: 'Error al restablecer la contraseña. Intenta de nuevo.' });
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
