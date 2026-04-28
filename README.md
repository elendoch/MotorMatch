# 🏍️ MotorMatch

Aplicación web para comparación, análisis de costos y recomendación de motocicletas.  
Desarrollada con React (frontend), Node.js/Express (backend) y PostgreSQL con Supabase.

---

## 📁 Estructura del proyecto

```
motormatch/
├── frontend/          ← Aplicación React
│   ├── public/
│   └── src/
│       ├── components/    ← Componentes reutilizables
│       ├── pages/         ← Páginas de la app
│       ├── services/      ← Llamadas a la API (Axios)
│       └── styles/        ← CSS global
└── backend/           ← API REST con Node.js
    ├── config/            ← Conexión BD y correo
    ├── controllers/       ← Lógica de negocio
    ├── middleware/        ← Verificación JWT
    ├── routes/            ← Definición de endpoints
    ├── database.sql       ← Script para crear tablas
    └── server.js          ← Punto de entrada
```

---

## ⚙️ Configuración inicial

### 1. Base de datos (Supabase)

En el panel de Supabase, ve a **SQL Editor** y ejecuta el contenido de `backend/database.sql`.  
Esto creará la tabla `usuarios`.

---

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # Copia y completa las variables
npm run dev            # Inicia en modo desarrollo (nodemon)
```

Variables requeridas en `backend/.env`:
| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de conexión de Supabase |
| `JWT_SECRET` | String secreto para firmar tokens |
| `EMAIL_HOST` | Servidor SMTP (ej: smtp.gmail.com) |
| `EMAIL_PORT` | Puerto SMTP (587 para TLS) |
| `EMAIL_USER` | Tu correo Gmail |
| `EMAIL_PASS` | Contraseña de aplicación de Gmail |
| `FRONTEND_URL` | URL del frontend (http://localhost:3000) |

> **Nota Gmail:** Para usar Gmail como SMTP, activa la verificación en dos pasos y genera una "Contraseña de aplicación" en tu cuenta de Google.

---

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # Copia y completa las variables
npm start              # Inicia en http://localhost:3000
```

Variables requeridas en `frontend/.env`:
| Variable | Descripción |
|---|---|
| `REACT_APP_API_URL` | URL del backend (http://localhost:5000/api) |

---

## 🔗 Endpoints de la API

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/forgot-password` | Enviar correo de recuperación |

---

## 🔒 Seguridad implementada

- **Contraseñas hasheadas** con bcrypt (salt rounds: 12)
- **Autenticación con JWT** (tokens con expiración de 7 días)
- **Validación de correo duplicado** al registrarse
- **Validación de contraseña fuerte**: mínimo 10 caracteres, número, minúscula, mayúscula y símbolo
- **CORS** configurado para aceptar solo el origen del frontend
