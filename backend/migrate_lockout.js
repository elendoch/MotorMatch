const pool = require('./config/db');

async function migrate() {
  try {
    console.log('Agregando columnas intentos_fallidos y bloqueado_hasta...');
    await pool.query(`
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS intentos_fallidos INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS bloqueado_hasta TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    `);
    console.log('Migración completada exitosamente.');
  } catch (err) {
    console.error('Error durante la migración:', err);
  } finally {
    pool.end();
  }
}

migrate();
