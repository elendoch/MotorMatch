// routes/favoritesRoutes.js
// Rutas de la API para gestión de favoritos.
// Todas protegidas con verifyToken → requieren header:
//   Authorization: Bearer <token>

const express = require('express');
const router = express.Router();
const { getFavoriteIds, addFavorite, removeFavorite } = require('../controllers/favoritesController');
const { verifyToken } = require('../middleware/authMiddleware');

// GET  /api/favorites          → IDs de favoritos del usuario
router.get('/', verifyToken, getFavoriteIds);

// POST /api/favorites/:bikeId  → Agregar moto a favoritos
router.post('/:bikeId', verifyToken, addFavorite);

// DELETE /api/favorites/:bikeId → Quitar moto de favoritos
router.delete('/:bikeId', verifyToken, removeFavorite);

module.exports = router;
