// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const { saveProfile, getProfile } = require('../controllers/profileController');

// Opcionalmente, aquí se podría agregar un middleware para verificar el JWT:
// const verifyToken = require('../middleware/authMiddleware');
// router.post('/', verifyToken, saveProfile);
// router.get('/', verifyToken, getProfile);

// POST /api/profile -> Guardar/Actualizar perfil
router.post('/', saveProfile);

// GET /api/profile -> Obtener perfil
router.get('/', getProfile);

module.exports = router;
