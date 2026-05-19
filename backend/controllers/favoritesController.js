// controllers/favoritesController.js
// Lógica de negocio para la tabla favorite_bikes.
// Todas las rutas de este controller están protegidas por verifyToken,
// por lo que req.user.id siempre contiene el ID del usuario autenticado.

const pool = require('../config/db');

// ============================================================
// OBTENER IDs DE MOTOS FAVORITAS DEL USUARIO
// GET /api/favorites
// Responde: { favoriteIds: [1, 4, 7, ...] }
// ============================================================
const getFavoriteIds = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT bike_id FROM favorite_bikes WHERE user_id = $1',
      [userId]
    );

    const favoriteIds = result.rows.map(r => r.bike_id);
    return res.status(200).json({ favoriteIds });

  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// ============================================================
// AGREGAR MOTO A FAVORITOS
// POST /api/favorites/:bikeId
// ON CONFLICT DO NOTHING → idempotente; no falla si ya existe.
// ============================================================
const addFavorite = async (req, res) => {
  const userId = req.user.id;
  const bikeId = parseInt(req.params.bikeId, 10);

  if (!bikeId || isNaN(bikeId)) {
    return res.status(400).json({ message: 'ID de moto inválido.' });
  }

  try {
    // Verificamos que la moto exista antes de insertar
    const bikeCheck = await pool.query(
      'SELECT id FROM bikes WHERE id = $1',
      [bikeId]
    );

    if (bikeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'La moto no existe.' });
    }

    await pool.query(
      `INSERT INTO favorite_bikes (user_id, bike_id)
       VALUES ($1, $2)
       ON CONFLICT ON CONSTRAINT unique_user_bike DO NOTHING`,
      [userId, bikeId]
    );

    return res.status(201).json({ message: 'Moto añadida a favoritos.', esFavorito: true });

  } catch (error) {
    console.error('Error al agregar favorito:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// ============================================================
// ELIMINAR MOTO DE FAVORITOS
// DELETE /api/favorites/:bikeId
// ============================================================
const removeFavorite = async (req, res) => {
  const userId = req.user.id;
  const bikeId = parseInt(req.params.bikeId, 10);

  if (!bikeId || isNaN(bikeId)) {
    return res.status(400).json({ message: 'ID de moto inválido.' });
  }

  try {
    await pool.query(
      'DELETE FROM favorite_bikes WHERE user_id = $1 AND bike_id = $2',
      [userId, bikeId]
    );

    return res.status(200).json({ message: 'Moto eliminada de favoritos.', esFavorito: false });

  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = { getFavoriteIds, addFavorite, removeFavorite };
