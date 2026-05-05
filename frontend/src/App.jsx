// App.jsx
// Componente raíz: configura el enrutamiento de la aplicación.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import './styles/global.css';

// Protege rutas que requieren sesión activa.
// Si no hay token en localStorage, redirige al login.
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

        {/* Página principal (requiere sesión) */}
        <Route
          path="/inicio"
          element={
            <RutaProtegida>
              <HomePage />
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
