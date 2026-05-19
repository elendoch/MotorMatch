import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import Survey from './pages/Survey';
import UserProfile from './pages/UserProfile';
import Garaje from './pages/Garaje';
import MotoDetail from './pages/MotoDetail';
import ComparePage from './pages/ComparePage';
import './styles/global.css';

function RutaProtegida({ children }) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/main" element={
          <RutaProtegida><HomePage /></RutaProtegida>
        } />

        <Route path="/survey" element={
          <RutaProtegida><Survey /></RutaProtegida>
        } />

        <Route path="/profile" element={
          <RutaProtegida><UserProfile /></RutaProtegida>
        } />

        {/* ----- COMPARISON page ----- */}
        <Route path="/comparar" element={
          <RutaProtegida><ComparePage /></RutaProtegida>
        } />

        <Route path="/motos" element={<Garaje />} />
        <Route path="/motos/:id" element={<MotoDetail />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
