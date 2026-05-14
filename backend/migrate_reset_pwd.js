const pool = require('./config/db');

async function migrate() {
  try {
    console.log('Agregando columnas reset_token y reset_token_expires...');
    await pool.query(`
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    `);
    console.log('Migración completada exitosamente.');
  } catch (err) {
    console.error('Error durante la migración:', err);
  } finally {
    pool.end();
  }
}

migrate();
