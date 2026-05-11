const pool = require('../config/db');

// Helpers de categorización
const catEstatura = (cm) => {
  const n = Number(cm);
  if (n < 160) return 'Baja';
  if (n <= 180) return 'Media';
  return 'Alta';
};
const catPeso = (kg) => {
  const n = Number(kg);
  if (n < 100) return 'Liviana';
  if (n <= 200) return 'Mediana';
  return 'Pesada';
};

// ── GET /api/usuarios/:id/perfil ──────────────────────────────
const obtenerPerfil = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM vista_perfil_usuario WHERE usuario_id = $1 LIMIT 1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

    const r = rows[0];
    res.json({
      usuario: {
        id: r.usuario_id,
        nombre: r.nombre,
        correo: r.correo,
        apodo: r.apodo,
        telefono: r.telefono,
        ciudad: r.ciudad,
        foto_url: r.foto_url,
        registro_en: r.registro_en,
      },
      motoPersonal: r.moto_id ? {
        id: r.moto_id,
        nombre: r.moto_nombre,
        marca: r.moto_marca,
        modelo: r.moto_modelo,
        anio: r.moto_anio,
        cc: r.moto_cc,
        imagen: r.moto_imagen,
        precio: r.moto_precio,
      } : null,
      cuestionarioCompletado: !!r.cuestionario_completado,
      preferencias: r.cuestionario_completado ? {
        id: r.preferencia_id,
        presupuesto: r.presupuesto,
        incluyeSOAT: r.incluye_soat,
        incluyeTraspaso: r.incluye_traspaso,
        tipoUso: r.tipo_uso,
        frecuenciaUso: r.frecuencia_uso,
        estatura: r.estatura,
        categoriaEstatura: catEstatura(r.estatura),
        pesoMoto: r.peso_moto,
        categoriaPeso: catPeso(r.peso_moto),
        transmision: r.transmision,
        fecha: r.cuestionario_fecha,
      } : null,
      estadisticas: {},
      actividadReciente: [],
      motosFavoritas: [],
    });
  } catch (err) {
    console.error('obtenerPerfil:', err);
    res.status(500).json({ error: 'Error interno' });
  }
};

// ── PUT /api/usuarios/:id/perfil ──────────────────────────────
const actualizarDatosBasicos = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, apodo, telefono, ciudad, foto_url } = req.body;

  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
  if (!correo?.trim()) return res.status(400).json({ error: 'El correo es obligatorio' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Actualizar datos en la tabla principal 'usuarios'
    await client.query(
      `UPDATE usuarios SET nombre = $1, correo = $2 WHERE id = $3`, 
      [nombre.trim(), correo.trim().toLowerCase(), id]
    );

    // Actualizar o insertar datos en 'usuarios_extra'
    await client.query(
      `INSERT INTO usuarios_extra (usuario_id, apodo, telefono, ciudad, foto_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (usuario_id) DO UPDATE SET
         apodo = EXCLUDED.apodo,
         telefono = EXCLUDED.telefono,
         ciudad = EXCLUDED.ciudad,
         foto_url = EXCLUDED.foto_url,
         updated_at = NOW()`,
      [id, apodo?.trim() || null, telefono?.trim() || null, ciudad?.trim() || null, foto_url?.trim() || null]
    );

    await client.query('COMMIT');
    res.json({ mensaje: 'Perfil actualizado' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('actualizarDatosBasicos:', err);
    // Si el error es por correo duplicado
    if (err.code === '23505' && err.constraint === 'usuarios_correo_key') {
      return res.status(400).json({ error: 'El correo ya está en uso por otro usuario' });
    }
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  } finally {
    client.release();
  }
};

// ── PUT /api/usuarios/:id/moto-personal ──────────────────────
const asignarMotoPersonal = async (req, res) => {
  const { id } = req.params;
  const { moto_id } = req.body;
  if (!moto_id) return res.status(400).json({ error: 'moto_id requerido' });

  try {
    // Adaptado a la tabla 'bikes'
    const { rows } = await pool.query(
      `SELECT id, name, brand, model, year, cc, image_url, price FROM bikes WHERE id = $1`,
      [moto_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Moto no encontrada en catálogo' });

    await pool.query(
      `INSERT INTO usuarios_extra (usuario_id, moto_id)
       VALUES ($1, $2)
       ON CONFLICT (usuario_id) DO UPDATE SET moto_id = EXCLUDED.moto_id, updated_at = NOW()`,
      [id, moto_id]
    );
    res.json({ mensaje: 'Moto personal asignada', moto: rows[0] });
  } catch (err) {
    console.error('asignarMotoPersonal:', err);
    res.status(500).json({ error: 'Error al asignar moto' });
  }
};

// ── DELETE /api/usuarios/:id/moto-personal ────────────────────
const eliminarMotoPersonal = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      `UPDATE usuarios_extra SET moto_id = NULL, updated_at = NOW() WHERE usuario_id = $1`,
      [id]
    );
    res.json({ mensaje: 'Moto personal eliminada' });
  } catch (err) {
    console.error('eliminarMotoPersonal:', err);
    res.status(500).json({ error: 'Error al eliminar moto' });
  }
};

// ── GET /api/catalogo/motos ───────────────────────────────────
const obtenerCatalogoMotos = async (req, res) => {
  const { search, marca } = req.query;
  try {
    // Adaptado a la tabla 'bikes'
    let query = `SELECT id, name, brand, model, year, cc, image_url, price FROM bikes WHERE 1=1`;
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR brand ILIKE $${params.length} OR model ILIKE $${params.length})`;
    }
    if (marca) {
      params.push(marca);
      query += ` AND brand = $${params.length}`;
    }
    query += ` ORDER BY brand, model`;
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('obtenerCatalogoMotos:', err);
    res.status(500).json({ error: 'Error al obtener catálogo' });
  }
};

// ── POST/PUT /api/usuarios/:id/cuestionario ───────────────────
const guardarCuestionario = async (req, res) => {
  const { id } = req.params;
  const {
    presupuesto, incluye_soat, incluye_traspaso,
    tipo_uso, frecuencia_uso,
    estatura, peso_moto, transmision,
  } = req.body;

  const errores = [];
  if (!presupuesto || presupuesto < 1000000) errores.push('Presupuesto mínimo: $1,000,000 COP');
  if (!tipo_uso) errores.push('Tipo de uso requerido');
  if (!estatura || estatura < 140 || estatura > 220) errores.push('Estatura inválida (140-220 cm)');
  if (!peso_moto || peso_moto < 50) errores.push('Peso de moto inválido');
  if (errores.length) return res.status(400).json({ errores });

  try {
    const { rows: existing } = await pool.query(
      `SELECT id FROM perfiles_motociclistas WHERE usuario_id = $1`, [id]
    );

    const params = [id, presupuesto, incluye_soat ?? false, incluye_traspaso ?? false,
                    tipo_uso, frecuencia_uso, estatura, peso_moto, transmision];

    let result;
    if (existing.length) {
      const { rows } = await pool.query(
        `UPDATE perfiles_motociclistas SET
           presupuesto=$2, incluye_soat=$3, incluye_traspaso=$4,
           tipo_uso=$5, frecuencia_uso=$6,
           estatura=$7, peso_moto=$8, transmision=$9, updated_at=NOW()
         WHERE usuario_id=$1 RETURNING *`,
        params
      );
      result = rows[0];
    } else {
      const { rows } = await pool.query(
        `INSERT INTO perfiles_motociclistas
           (usuario_id, presupuesto, incluye_soat, incluye_traspaso,
            tipo_uso, frecuencia_uso, estatura, peso_moto, transmision)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        params
      );
      result = rows[0];
    }

    res.status(201).json({
      mensaje: existing.length ? 'Cuestionario actualizado' : 'Cuestionario guardado',
      preferencias: result,
    });
  } catch (err) {
    console.error('guardarCuestionario:', err);
    res.status(500).json({ error: 'Error al guardar cuestionario' });
  }
};

module.exports = {
  obtenerPerfil, actualizarDatosBasicos,
  asignarMotoPersonal, eliminarMotoPersonal,
  obtenerCatalogoMotos, guardarCuestionario,
};
