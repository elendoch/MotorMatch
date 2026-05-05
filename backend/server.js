// server.js
// Punto de entrada principal del backend
// Configura Express, CORS, rutas y arranca el servidor

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
<<<<<<< Updated upstream
=======
const bikesRoutes = require('./routes/bikesRoutes');
const profileRoutes = require('./routes/profileRoutes');
>>>>>>> Stashed changes

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================

// CORS: permite peticiones desde el frontend (React en localhost:3000)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsear el body de las peticiones como JSON
app.use(express.json());

<<<<<<< Updated upstream
// ============================================================
// RUTAS DE LA API
// ============================================================
=======
// ── RUTAS ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/bikes', bikesRoutes);
app.use('/api/profile', profileRoutes);
>>>>>>> Stashed changes

// Todas las rutas de autenticación comienzan con /api/auth
app.use('/api/auth', authRoutes);

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({ message: '🏍️ MotorMatch API funcionando correctamente' });
});

// ============================================================
// ARRANCAR SERVIDOR
// ============================================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
