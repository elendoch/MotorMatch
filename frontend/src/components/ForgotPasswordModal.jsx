// components/ForgotPasswordModal.jsx
// Modal para recuperar contraseña
// Se muestra cuando el usuario hace clic en "¿Olvidaste tu contraseña?"

import { useState } from 'react';
import { recuperarContrasena } from '../services/api';

function ForgotPasswordModal({ onClose }) {
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);   // Controla si se mostró el éxito
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Maneja el envío del formulario del modal
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación básica del correo
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setCargando(true);
    try {
      await recuperarContrasena(correo);
      setEnviado(true); // Mostramos la pantalla de éxito
    } catch (err) {
      setError('No se pudo enviar el correo. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* Evitamos que clics dentro del modal lo cierren */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* close button */}
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>

        <header className="modal-header">
          <h3>Recuperar contraseña</h3>
          <p>Ingresa tu correo para enviarte un correo de recuperación.</p>
        </header>

        {/* email sent successfully view */}
        {enviado ? (
          <div className="modal-success">
            {/* Ícono de check verde (SVG simple) */}
            <span className="success-icon">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect width="56" height="56" rx="28" fill="#f0fdf4"/>
                <path d="M16 28L24 36L40 20" stroke="#22c55e" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <p>Revisa tu correo para acceder al enlace de recuperación.</p>
            <button className="btn-close-modal" onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          /* form view */
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="correo-modal">Correo electrónico</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  id="correo-modal"
                  type="email"
                  className={`form-input ${error ? 'error' : ''}`}
                  placeholder="ejemplo@motormatch.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

              <button type="submit" className="btn-primary-modal" disabled={cargando}>
                {cargando ? 'Enviando...' : 'Enviar enlace'}
              </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default ForgotPasswordModal;
