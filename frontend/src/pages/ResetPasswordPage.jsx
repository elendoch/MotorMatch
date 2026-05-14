import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetearContrasena } from '../services/api';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ contrasena: '', confirmar: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPass, setVerPass] = useState({ p1: false, p2: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!token) {
      setError('El enlace no es válido o está incompleto.');
      return;
    }

    if (formData.contrasena.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    if (formData.contrasena !== formData.confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      const res = await resetearContrasena(token, formData.contrasena);
      setExito(res.data.message || 'Contraseña restablecida correctamente.');
      setFormData({ contrasena: '', confirmar: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer contraseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-panel-left" aria-hidden="true">
        <img
          src="https://static.wikia.nocookie.net/esgta/images/c/c5/Freeway_SA.png/revision/latest?cb=20240116185650"
          alt=""
        />
        <div className="overlay">
          <h1>Tu próxima aventura comienza aquí</h1>
          <p>Compara, elige y encuentra la moto perfecta para ti en Colombia.</p>
        </div>
        <a href="/" className="auth-logo">
          <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"/>
          </svg>
          MotorMatch
        </a>
      </aside>

      <section className="auth-panel-right">
        <h2>Restablecer contraseña</h2>
        <p className="auth-subtitle">Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.</p>

        {exito ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="alert" style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.5rem' }}>¡Éxito!</strong>
              {exito}
            </div>
            <button className="btn-primary" onClick={() => navigate('/')}>
              Ir a Iniciar Sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && <p className="alert alert-error" role="alert">{error}</p>}

            <div className="form-group">
              <label className="form-label" htmlFor="reset-pass">Nueva contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="reset-pass"
                  type={verPass.p1 ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.contrasena}
                  onChange={e => setFormData({ ...formData, contrasena: e.target.value })}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setVerPass(v => ({ ...v, p1: !v.p1 }))}
                >
                  {verPass.p1 ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-confirm">Confirmar nueva contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="reset-confirm"
                  type={verPass.p2 ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmar}
                  onChange={e => setFormData({ ...formData, confirmar: e.target.value })}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setVerPass(v => ({ ...v, p2: !v.p2 }))}
                >
                  {verPass.p2 ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={cargando}>
              {cargando ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </button>

            <p className="auth-footer">
              <button type="button" onClick={() => navigate('/')}>Volver al login</button>
            </p>
          </form>
        )}
      </section>
    </div>
  );
}

export default ResetPasswordPage;
