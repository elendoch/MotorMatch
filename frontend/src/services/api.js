// services/api.js
// Configura Axios para hacer peticiones HTTP al backend
// Todas las llamadas a la API pasan por este archivo

import axios from 'axios';

// La URL base viene del archivo .env del frontend
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: añade el token JWT a cada petición automáticamente
// si el usuario tiene sesión activa
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================================

// Registrar nuevo usuario
export const registrarUsuario = (datos) =>
  api.post('/auth/register', datos);

// Iniciar sesión
export const iniciarSesion = (datos) =>
  api.post('/auth/login', datos);

// Enviar correo de recuperación de contraseña
export const recuperarContrasena = (correo) =>
  api.post('/auth/forgot-password', { correo });

export default api;
