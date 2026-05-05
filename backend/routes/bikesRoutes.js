// routes/bikesRoutes.js
// Rutas del catálogo de motocicletas.
// Por ahora es pública; cuando tengan más funciones pueden protegerla con authMiddleware.

const express = require('express');
const router = express.Router();
const { getBikes } = require('../controllers/bikesController');

// GET /api/bikes → devuelve todas las motos
router.get('/', getBikes);

module.exports = router;
