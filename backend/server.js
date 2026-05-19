// server.js
// Punto de entrada del backend.
// Configura Express, CORS, rutas y arranca el servidor.

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bikesRoutes = require('./routes/bikesRoutes');
const profileRoutes = require('./routes/profileRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origen no permitido → ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ── RUTAS ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/bikes', bikesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', perfilRoutes);
app.use('/api/favorites', favoritesRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🏍️ MotorMatch API funcionando correctamente' });
});

// ── ARRANCAR ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
