// config/db.js
// Configura la conexión a PostgreSQL usando el módulo 'pg'
// Usa la variable DATABASE_URL del archivo .env

const { Pool } = require('pg');
require('dotenv').config();

// Pool mantiene un conjunto de conexiones reutilizables a la BD
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requiere SSL en producción
  ssl: {
    rejectUnauthorized: false
  }
});

// Verificamos la conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
  } else {
    console.log('✅ Conexión a la base de datos establecida');
    release();
  }
});

module.exports = pool;
