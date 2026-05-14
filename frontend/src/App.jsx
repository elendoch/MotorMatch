import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import Survey from './pages/Survey';
import UserProfile from './pages/UserProfile';
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

        {/* ----- RESET password page ----- */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ----- MAIN page ----- */}
        <Route
          path="/main"
          element={
            <RutaProtegida>
              <HomePage />
            </RutaProtegida>
          }
        />

        {/* ----- user SURVEY page ----- */}
        <Route
          path="/survey"
          element={
            <RutaProtegida>
              <Survey />
            </RutaProtegida>
          }
        />

        {/* ----- user DASHBOARD page ----- */}
        <Route
          path="/profile"
          element={
            <RutaProtegida>
              <UserProfile />
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
