const pool = require('../config/db');

// Mapeo profesional: Traducimos del esquema DB (Inglés) al esquema UI (Español)
// Evitamos 'ñ' en las llaves del objeto para máxima compatibilidad.
const mapBike = (b) => ({
  id: b.id,
  nombre: b.name,
  marca: b.brand,
  modelo: b.model,
  precio: b.price,
  anio: b.year, // 'year' -> 'anio'
  cc: b.cc,
  hp: b.hp,
  peso_kg: b.weight_kg,
  altura_asiento_cm: b.seat_height_cm,
  ancho_asiento_cm: b.seat_width_cm,
  tipo_combustible: b.fuel_type,
  capacidad_combustible: b.fuel_capacity,
  consumo: b.consumption,
  transmision: b.transmission,
  imagen_url: b.image_url
});

// GET /api/bikes
const getBikes = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM bikes ORDER BY brand ASC, name ASC');
    res.json(rows.map(mapBike));
  } catch (err) {
    console.error('Error getBikes:', err);
    res.status(500).json({ error: 'Error al obtener el catálogo' });
  }
};

// GET /api/bikes/:id
const getBikeById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM bikes WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Moto no encontrada' });
    res.json(mapBike(rows[0]));
  } catch (err) {
    console.error('Error getBikeById:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// GET /api/bikes/gallery
const getGallery = async (req, res) => {
  const { id, marca } = req.query;
  try {
    let { rows } = await pool.query(
      'SELECT * FROM bikes WHERE brand = $1 AND id != $2 LIMIT 3',
      [marca, id]
    );
    if (rows.length === 0) {
      const fallback = await pool.query('SELECT * FROM bikes WHERE id != $1 LIMIT 3', [id]);
      rows = fallback.rows;
    }
    res.json(rows.map(mapBike));
  } catch (err) {
    console.error('Error getGallery:', err);
    res.status(500).json({ error: 'Error al obtener galería' });
  }
};

module.exports = { getBikes, getBikeById, getGallery };
