// controllers/bikesController.js
// Controlador para el catálogo de motocicletas.
// Por ahora solo expone la consulta de todas las motos.

const pool = require('../config/db');

// GET /api/bikes
// Devuelve todas las motos de la tabla bikes ordenadas por precio ascendente
const getBikes = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, name, brand, model, price, year, cc, hp, image_url
       FROM bikes
       ORDER BY price ASC NULLS LAST`
    );
    return res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener motos:', error);
    return res.status(500).json({ message: 'Error al obtener el catálogo de motos.' });
  }
};

module.exports = { getBikes };
