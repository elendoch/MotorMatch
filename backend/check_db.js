const pool = require('./config/db');

const check = async () => {
  try {
    const { rows } = await pool.query('SELECT * FROM bikes LIMIT 1');
    console.log('--- COLUMNAS ENCONTRADAS EN TABLA BIKES ---');
    if (rows.length > 0) {
      console.log(Object.keys(rows[0]));
      console.log('--- EJEMPLO DE DATOS ---');
      console.log(rows[0]);
    } else {
      console.log('La tabla está vacía.');
    }
  } catch (err) {
    console.error('Error al consultar:', err);
  } finally {
    process.exit();
  }
};

check();
