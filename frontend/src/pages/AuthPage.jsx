// pages/AuthPage.jsx
// ÚNICO cambio respecto a la versión original:
// navigate('/bienvenido')  →  navigate('/inicio')
// El resto del componente permanece igual.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { registrarUsuario, iniciarSesion } from '../services/api';

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [modalAbierto, setModalAbierto] = useState(false);

  // Estado login
  const [loginData, setLoginData] = useState({ correo: '', contrasena: '' });
  const [loginErrors, setLoginErrors] = useState({});
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginAlert, setLoginAlert] = useState(null);

  // Estado registro
  const [registerData, setRegisterData] = useState({
    nombre: '', correo: '', contrasena: '', confirmar: '', terminos: false
  });
  const [registerErrors, setRegisterErrors] = useState({});
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerAlert, setRegisterAlert] = useState(null);

  // Mostrar/ocultar contraseña
  const [verPass, setVerPass] = useState({ login: false, reg: false, reg2: false });

  // ── Validaciones ───────────────────────────────────────────

  function validarLogin() {
    const errors = {};
    if (!loginData.correo) errors.correo = 'El correo es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(loginData.correo)) errors.correo = 'Correo inválido.';
    if (!loginData.contrasena) errors.contrasena = 'La contraseña es obligatoria.';
    return errors;
  }

  function validarRegistro() {
    const errors = {};
    if (!registerData.nombre.trim()) errors.nombre = 'El nombre es obligatorio.';
    if (!registerData.correo) errors.correo = 'El correo es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(registerData.correo)) errors.correo = 'Correo inválido.';
    if (!registerData.contrasena) errors.contrasena = 'La contraseña es obligatoria.';
    else if (registerData.contrasena.length < 8) errors.contrasena = 'Mínimo 8 caracteres.';
    if (registerData.contrasena !== registerData.confirmar) errors.confirmar = 'Las contraseñas no coinciden.';
    if (!registerData.terminos) errors.terminos = 'Debes aceptar los términos.';
    return errors;
  }

  // ── Handlers ───────────────────────────────────────────────

  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = validarLogin();
    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoginLoading(true);
    setLoginAlert(null);
    try {
      const res = await iniciarSesion(loginData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      navigate('/inicio');                          // ← redirige a la página principal
    } catch (err) {
      setLoginAlert(err.response?.data?.message || 'Error al iniciar sesión.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = validarRegistro();
    setRegisterErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setRegisterLoading(true);
    setRegisterAlert(null);
    try {
      const res = await registrarUsuario({
        nombre: registerData.nombre,
        correo: registerData.correo,
        contrasena: registerData.contrasena,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      navigate('/inicio');                          // ← redirige a la página principal
    } catch (err) {
      setRegisterAlert(err.response?.data?.message || 'Error al crear la cuenta.');
    } finally {
      setRegisterLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="auth-page">
      {/* Panel izquierdo decorativo */}
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

      {/* Panel derecho: formulario */}
      <section className="auth-panel-right">
        <h2>{tab === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}</h2>
        <p className="auth-subtitle">
          {tab === 'login' ? 'Inicia sesión para continuar.' : 'Regístrate gratis hoy.'}
        </p>

        {/* Tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'login'}
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Iniciar Sesión
          </button>
          <button
            role="tab"
            aria-selected={tab === 'register'}
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Registrarse
          </button>
        </div>

        {/* ── Formulario de Login ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} noValidate>
            {loginAlert && <p className="alert alert-error" role="alert">{loginAlert}</p>}

            <div className="form-group">
              <label className="form-label" htmlFor="login-correo">Correo electrónico</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  id="login-correo"
                  type="email"
                  className={`form-input ${loginErrors.correo ? 'error' : ''}`}
                  placeholder="tu@correo.com"
                  value={loginData.correo}
                  onChange={e => setLoginData({ ...loginData, correo: e.target.value })}
                  autoComplete="email"
                />
              </div>
              {loginErrors.correo && <p className="field-error">{loginErrors.correo}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-pass">Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="login-pass"
                  type={verPass.login ? 'text' : 'password'}
                  className={`form-input ${loginErrors.contrasena ? 'error' : ''}`}
                  placeholder="Tu contraseña"
                  value={loginData.contrasena}
                  onChange={e => setLoginData({ ...loginData, contrasena: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setVerPass(v => ({ ...v, login: !v.login }))}
                  aria-label={verPass.login ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {verPass.login ? '🙈' : '👁'}
                </button>
              </div>
              {loginErrors.contrasena && <p className="field-error">{loginErrors.contrasena}</p>}
            </div>

            <div className="form-options-row">
              <label>
                <input type="checkbox" /> Recordarme
              </label>
              <button type="button" className="link-orange" onClick={() => setModalAbierto(true)}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" className="btn-primary" disabled={loginLoading}>
              {loginLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>

            <p className="auth-footer">
              ¿No tienes cuenta?{' '}
              <button type="button" onClick={() => setTab('register')}>Regístrate</button>
            </p>
          </form>
        )}

        {/* ── Formulario de Registro ── */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} noValidate>
            {registerAlert && <p className="alert alert-error" role="alert">{registerAlert}</p>}

            <div className="form-group">
              <label className="form-label" htmlFor="reg-nombre">Nombre completo</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="reg-nombre"
                  type="text"
                  className={`form-input ${registerErrors.nombre ? 'error' : ''}`}
                  placeholder="Tu nombre"
                  value={registerData.nombre}
                  onChange={e => setRegisterData({ ...registerData, nombre: e.target.value })}
                  autoComplete="name"
                />
              </div>
              {registerErrors.nombre && <p className="field-error">{registerErrors.nombre}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-correo">Correo electrónico</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  id="reg-correo"
                  type="email"
                  className={`form-input ${registerErrors.correo ? 'error' : ''}`}
                  placeholder="tu@correo.com"
                  value={registerData.correo}
                  onChange={e => setRegisterData({ ...registerData, correo: e.target.value })}
                  autoComplete="email"
                />
              </div>
              {registerErrors.correo && <p className="field-error">{registerErrors.correo}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-pass">Contraseña</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="reg-pass"
                    type={verPass.reg ? 'text' : 'password'}
                    className={`form-input ${registerErrors.contrasena ? 'error' : ''}`}
                    placeholder="Mínimo 8 caracteres"
                    value={registerData.contrasena}
                    onChange={e => setRegisterData({ ...registerData, contrasena: e.target.value })}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setVerPass(v => ({ ...v, reg: !v.reg }))}
                    aria-label={verPass.reg ? 'Ocultar' : 'Mostrar'}
                  >
                    {verPass.reg ? '🙈' : '👁'}
                  </button>
                </div>
                {registerErrors.contrasena && <p className="field-error">{registerErrors.contrasena}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirmar</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="reg-confirm"
                    type={verPass.reg2 ? 'text' : 'password'}
                    className={`form-input ${registerErrors.confirmar ? 'error' : ''}`}
                    placeholder="Repite tu contraseña"
                    value={registerData.confirmar}
                    onChange={e => setRegisterData({ ...registerData, confirmar: e.target.value })}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setVerPass(v => ({ ...v, reg2: !v.reg2 }))}
                    aria-label={verPass.reg2 ? 'Ocultar' : 'Mostrar'}
                  >
                    {verPass.reg2 ? '🙈' : '👁'}
                  </button>
                </div>
                {registerErrors.confirmar && <p className="field-error">{registerErrors.confirmar}</p>}
              </div>
            </div>

            <div className="form-checkbox-row">
              <input
                id="terminos"
                type="checkbox"
                checked={registerData.terminos}
                onChange={e => setRegisterData({ ...registerData, terminos: e.target.checked })}
              />
              <label htmlFor="terminos">
                Acepto los <a href="#">Términos de Uso</a> y la <a href="#">Política de Privacidad</a>
              </label>
            </div>
            {registerErrors.terminos && <p className="field-error">{registerErrors.terminos}</p>}

            <button type="submit" className="btn-primary" disabled={registerLoading}>
              {registerLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>

            <p className="auth-footer">
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={() => setTab('login')}>Inicia sesión</button>
            </p>
          </form>
        )}
      </section>

      {modalAbierto && (
        <ForgotPasswordModal onClose={() => setModalAbierto(false)} />
      )}
    </div>
  );
}

export default AuthPage;
