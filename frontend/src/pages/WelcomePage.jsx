// temporal main page


import { useNavigate } from 'react-router-dom';

function WelcomePage() {
  const navigate = useNavigate();

  // get the user data
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');


  // clean localStorage -> back to login
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <span className="welcome-icon">🏍️</span>
        <h1>¡Inicio de sesión exitoso!</h1>
        <p>
          Bienvenido, <strong>{usuario.nombre || 'Usuario'}</strong>.<br />
          El dashboard principal estará disponible próximamente.
        </p>
        <button className="btn-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;
