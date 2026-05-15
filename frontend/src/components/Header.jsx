// footer design for all pages
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  // Lee el usuario guardado al iniciar sesión
  const usuarioRaw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  const usuario = JSON.parse(usuarioRaw || '{}');
  const iniciales = usuario.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  // Cierra el menú si el usuario hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Logo */}
        <a href="/main" className="header-logo" aria-label="MotorMatch - Página principal">
          <svg className="logo-icon" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"/>
          </svg>
          <span>MotorMatch</span>
        </a>

        {/* ----- user MENU ----- */}
        <nav className="header-nav" ref={menuRef}>
          <button
            className="user-menu-btn"
            onClick={() => setMenuAbierto(prev => !prev)}
            aria-haspopup="true"
            aria-expanded={menuAbierto}
            aria-label="Menú de usuario"
          >
            <span className="user-avatar" aria-hidden="true">{iniciales}</span>
            <span className="user-name">Hola, {usuario.nombre?.split(' ')[0] || 'Usuario'}</span>
            <span className="chevron" aria-hidden="true">▾</span>
          </button>

          {menuAbierto && (
            <ul className="user-dropdown" role="menu">
              <li role="none">
                <p className="dropdown-greeting">
                  {usuario.nombre || 'Usuario'}<br />
                  <small>{usuario.correo}</small>
                </p>
              </li>
              <li role="none">
                <button
                  role="menuitem"
                  className="dropdown-item"
                  onClick={() => {
                    setMenuAbierto(false);
                    navigate('/profile');
                  }}
                >
                  {/* ----- user button symbol ----- */}
                  <span className="material-symbols-outlined tune-icon">person</span>
                  Perfil
                </button>
              </li>
              <li>
                <button role="menuitem" className="dropdown-item">
                  {/* ----- history button symbol ----- */}
                  <span className="material-symbols-outlined tune-icon">history</span>
                  Historial de comparaciones
                </button>
              </li>

              <li role="none">
                <button
                  role="menuitem"
                  className="dropdown-item dropdown-logout"
                  onClick={handleLogout}
                >
                  <span class="material-symbols-outlined" tune-icon>logout</span>
                  Cerrar sesión
                </button>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;