// server.js
// Punto de entrada principal del backend
// Configura Express, CORS, rutas y arranca el servidor

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================

// CORS: permite peticiones desde el frontend desplegado en Vercel.
// FRONTEND_URL se define en las variables de entorno de Vercel
// (ej: https://motormatch.vercel.app)
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite peticiones sin origin (ej: Postman, curl) en entornos de prueba
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origen no permitido → ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parsear el body de las peticiones como JSON
app.use(express.json());

// ============================================================
// RUTAS DE LA API
// ============================================================

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
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
