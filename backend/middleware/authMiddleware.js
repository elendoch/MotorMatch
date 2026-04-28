// middleware/authMiddleware.js
// Middleware que verifica si el usuario tiene un token JWT válido
// Se usa para proteger rutas que requieren autenticación

const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  // El token viene en el header Authorization: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    // Verificamos el token con el secreto del .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adjuntamos el payload del token al request
    next(); // Continuamos al siguiente handler
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = { verifyToken };
