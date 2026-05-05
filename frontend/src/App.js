// App.js
// Componente raíz de la aplicación
// Configura el enrutamiento con React Router

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
<<<<<<< Updated upstream:frontend/src/App.js
import WelcomePage from './pages/WelcomePage';
=======
import HomePage from './pages/HomePage';
import MotorcycleProfile from './pages/MotorcycleProfile';
>>>>>>> Stashed changes:frontend/src/App.jsx
import './styles/global.css';

// Componente para proteger rutas que requieren autenticación
// Si no hay token en localStorage, redirige al login
function RutaProtegida({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de autenticación (login + registro) */}
        <Route path="/" element={<AuthPage />} />

        {/* Página de bienvenida (protegida: requiere estar logueado) */}
        <Route
          path="/bienvenido"
          element={
            <RutaProtegida>
              <WelcomePage />
            </RutaProtegida>
          }
        />

        {/* Página de perfil motociclista (requiere sesión) */}
        <Route
          path="/perfil-moto"
          element={
            <RutaProtegida>
              <MotorcycleProfile />
            </RutaProtegida>
          }
        />

        {/* Cualquier ruta desconocida redirige al login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
