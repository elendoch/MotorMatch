const pool = require('./config/db');

async function checkDB() {
  try {
    const res = await pool.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = \'public\'');
    console.log('Tables in public schema:');
    res.rows.forEach(row => console.log(` - ${row.tablename}`));
    
    const usersCount = await pool.query('SELECT count(*) FROM usuarios');
    console.log(`Number of users: ${usersCount.rows[0].count}`);
  } catch (err) {
    console.error('❌ Error checking DB:', err.message);
  } finally {
    await pool.end();
  }
}

checkDB();
