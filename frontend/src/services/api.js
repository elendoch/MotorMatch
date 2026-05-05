// services/api.js
// Configura Axios para hacer peticiones HTTP al backend
// Todas las llamadas a la API pasan por este archivo

import axios from 'axios';

// En Vite las variables de entorno se acceden con import.meta.env
// y deben tener el prefijo VITE_ (en lugar de REACT_APP_ de CRA)
// El valor se define en .env y en las variables de entorno de Vercel
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
