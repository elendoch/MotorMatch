// controllers/profileController.js
const pool = require('../config/db');

// ============================================================
// GUARDAR O ACTUALIZAR PERFIL DE MOTOCICLETA
// POST /api/profile
// ============================================================
const saveProfile = async (req, res) => {
  // Obtenemos el usuario autenticado desde el middleware (req.user)
  // Como estamos en desarrollo, si no hay middleware de auth temporalmente,
  // asumiremos que se envía el usuario_id en el body o usaremos el req.user
  const usuario_id = req.user ? req.user.id : req.body.usuario_id;
  
  const {
    presupuesto,
    incluye_soat,
    incluye_traspaso,
    tipo_uso,
    frecuencia_uso,
    lleva_pasajero,
    estatura,
    peso_moto,
    transmision
  } = req.body;

  // Validaciones
  if (!usuario_id) {
    return res.status(401).json({ message: 'No autorizado. Se requiere iniciar sesión.' });
  }

  if (
    presupuesto === undefined ||
    !tipo_uso ||
    !frecuencia_uso ||
    lleva_pasajero === undefined ||
    !estatura ||
    !peso_moto ||
    !transmision
  ) {
    return res.status(400).json({ message: 'Por favor, completa todos los campos requeridos.' });
  }

  try {
    // Usamos INSERT ... ON CONFLICT para crear si no existe o actualizar si ya existe
    const result = await pool.query(
      `INSERT INTO perfiles_motociclistas 
        (usuario_id, presupuesto, incluye_soat, incluye_traspaso, tipo_uso, frecuencia_uso, lleva_pasajero, estatura, peso_moto, transmision, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
       ON CONFLICT (usuario_id) 
       DO UPDATE SET 
        presupuesto = EXCLUDED.presupuesto,
        incluye_soat = EXCLUDED.incluye_soat,
        incluye_traspaso = EXCLUDED.incluye_traspaso,
        tipo_uso = EXCLUDED.tipo_uso,
        frecuencia_uso = EXCLUDED.frecuencia_uso,
        lleva_pasajero = EXCLUDED.lleva_pasajero,
        estatura = EXCLUDED.estatura,
        peso_moto = EXCLUDED.peso_moto,
        transmision = EXCLUDED.transmision,
        updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        usuario_id,
        presupuesto,
        incluye_soat || false,
        incluye_traspaso || false,
        tipo_uso,
        frecuencia_uso,
        lleva_pasajero,
        estatura,
        peso_moto,
        transmision
      ]
    );

    return res.status(200).json({
      message: 'Perfil guardado exitosamente.',
      perfil: result.rows[0]
    });

  } catch (error) {
    console.error('Error guardando perfil:', error);
    return res.status(500).json({ message: 'Error interno del servidor al guardar el perfil.' });
  }
};

// ============================================================
// OBTENER PERFIL DE MOTOCICLETA
// GET /api/profile
// ============================================================
const getProfile = async (req, res) => {
  const usuario_id = req.user ? req.user.id : req.query.usuario_id;

  if (!usuario_id) {
    return res.status(401).json({ message: 'No autorizado.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM perfiles_motociclistas WHERE usuario_id = $1',
      [usuario_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Perfil no encontrado.' });
    }

    return res.status(200).json({ perfil: result.rows[0] });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = { saveProfile, getProfile };
