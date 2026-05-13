// App.jsx
// Componente raíz: configura el enrutamiento de la aplicación.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import MotorcycleProfile from './pages/MotorcycleProfile';
import Perfil from './pages/Perfil';
import Garaje from './pages/Garaje';
import MotoDetail from './pages/MotoDetail';
import './styles/global.css';

// Protege rutas que requieren sesión activa.
// Si no hay token en localStorage, redirige al login.
function RutaProtegida({ children }) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de autenticación (login + registro) */}
        <Route path="/" element={<AuthPage />} />

        {/* Página para restablecer contraseña */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Página principal (requiere sesión) */}
        <Route
          path="/inicio"
          element={
            <RutaProtegida>
              <HomePage />
            </RutaProtegida>
          }
        />

        {/* Perfil Motociclista (requiere sesión) */}
        <Route
          path="/perfil-moto"
          element={
            <RutaProtegida>
              <MotorcycleProfile />
            </RutaProtegida>
          }
        />

        {/* Dashboard de Usuario (requiere sesión) */}
        <Route
          path="/perfil"
          element={
            <RutaProtegida>
              <Perfil />
            </RutaProtegida>
          }
        />

        <Route path="/motos" element={<Garaje />} />
        <Route path="/motos/:id" element={<MotoDetail />} />
        {/* Cualquier ruta desconocida redirige al login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
