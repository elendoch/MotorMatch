const pool = require('./config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('--- Iniciando Migración ---');

    // 1. UNIQUE constraint en perfiles_motociclistas
    console.log('1. Configurando constraint UNIQUE en perfiles_motociclistas...');
    await client.query(`
      DELETE FROM perfiles_motociclistas
      WHERE id NOT IN (
        SELECT MAX(id) FROM perfiles_motociclistas GROUP BY usuario_id
      );
    `);
    try {
      await client.query(`ALTER TABLE perfiles_motociclistas ADD CONSTRAINT uniq_perfil_usuario UNIQUE (usuario_id);`);
    } catch (e) {
      console.log('Nota: El constraint UNIQUE ya existía o se saltó.');
    }

    // 2. Crear tabla usuarios_extra
    console.log('2. Creando tabla usuarios_extra...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios_extra (
        id          SERIAL PRIMARY KEY,
        usuario_id  INT4 NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
        apodo       VARCHAR(100),
        telefono    VARCHAR(30),
        ciudad      VARCHAR(120),
        foto_url    TEXT,
        moto_id     INT4 REFERENCES bikes(id) ON DELETE SET NULL,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Trigger para updated_at
    console.log('3. Configurando trigger para updated_at...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS set_usuarios_extra_updated_at ON usuarios_extra;
      CREATE TRIGGER set_usuarios_extra_updated_at
        BEFORE UPDATE ON usuarios_extra
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // 4. Vista perfil completo (OMITIENDO lleva_pasajero)
    // Adaptado a la tabla real 'bikes' y sus columnas en inglés
    console.log('4. Creando vista vista_perfil_usuario...');
    await client.query(`
      CREATE OR REPLACE VIEW vista_perfil_usuario AS
      SELECT
        u.id              AS usuario_id,
        u.nombre,
        u.correo,
        u.created_at      AS registro_en,
        ue.apodo,
        ue.telefono,
        ue.ciudad,
        ue.foto_url,
        ue.moto_id,
        b.name            AS moto_nombre,
        b.brand           AS moto_marca,
        b.model           AS moto_modelo,
        b.year            AS moto_año,
        b.cc              AS moto_cc,
        b.image_url       AS moto_imagen,
        b.price           AS moto_precio,
        CASE WHEN pm.id IS NOT NULL THEN TRUE ELSE FALSE END AS cuestionario_completado,
        pm.id             AS preferencia_id,
        pm.presupuesto,
        pm.incluye_soat,
        pm.incluye_traspaso,
        pm.tipo_uso,
        pm.frecuencia_uso,
        pm.estatura,
        pm.peso_moto,
        pm.transmision,
        pm.created_at     AS cuestionario_fecha
      FROM usuarios u
      LEFT JOIN usuarios_extra ue         ON ue.usuario_id = u.id
      LEFT JOIN bikes b                   ON b.id = ue.moto_id
      LEFT JOIN perfiles_motociclistas pm ON pm.usuario_id = u.id;
    `);

    await client.query('COMMIT');
    console.log('✅ Migración completada exitosamente.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error en la migración:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
