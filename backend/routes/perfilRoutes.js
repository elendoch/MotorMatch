const express = require('express');
const router = express.Router();
const {
  obtenerPerfil, actualizarDatosBasicos,
  asignarMotoPersonal, eliminarMotoPersonal,
  obtenerCatalogoMotos, guardarCuestionario,
} = require('../controllers/perfilController');

// Rutas de perfil de usuario
router.get('/usuarios/:id/perfil',           obtenerPerfil);
router.put('/usuarios/:id/perfil',           actualizarDatosBasicos);
router.put('/usuarios/:id/moto-personal',    asignarMotoPersonal);
router.delete('/usuarios/:id/moto-personal', eliminarMotoPersonal);
router.post('/usuarios/:id/cuestionario',    guardarCuestionario);
router.put('/usuarios/:id/cuestionario',     guardarCuestionario);
router.get('/catalogo/motos',                obtenerCatalogoMotos);

module.exports = router;
