-- database.sql
-- Ejecuta este script en el editor SQL de Supabase para crear las tablas necesarias.

-- 1. Crear tabla de usuarios (si no existe)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(255) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla de perfiles_motociclistas
CREATE TABLE IF NOT EXISTS perfiles_motociclistas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  presupuesto INTEGER NOT NULL,
  incluye_soat BOOLEAN DEFAULT false,
  incluye_traspaso BOOLEAN DEFAULT false,
  tipo_uso VARCHAR(50) NOT NULL,
  frecuencia_uso VARCHAR(50) NOT NULL,
  lleva_pasajero BOOLEAN NOT NULL,
  estatura VARCHAR(50) NOT NULL,
  peso_moto VARCHAR(50) NOT NULL,
  transmision VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_usuario_perfil UNIQUE (usuario_id)
);
