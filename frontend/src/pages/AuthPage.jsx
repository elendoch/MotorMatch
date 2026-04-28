import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { iniciarSesion, registrarUsuario } from '../services/api';
import ForgotPasswordModal from '../components/ForgotPasswordModal';


// ----- password validation -----
const validarContrasena = (contrasena) => {
  const errores = [];
  if (contrasena.length < 10)       errores.push('Al menos 10 caracteres');
  if (!/[0-9]/.test(contrasena))    errores.push('Un número');
  if (!/[a-z]/.test(contrasena))    errores.push('Una letra minúscula');
  if (!/[A-Z]/.test(contrasena))    errores.push('Una letra mayúscula');
  if (!/[^a-zA-Z0-9]/.test(contrasena)) errores.push('Un símbolo (ej: !@#$)');
  return errores;
};


function AuthPage() {
  const navigate = useNavigate();

  // Tab activo: 'login' o 'register'
  const [tabActivo, setTabActivo] = useState('login');

  // Estado del modal de recuperación
  const [mostrarModal, setMostrarModal] = useState(false);


  // ---- login form ----
  const [loginDatos, setLoginDatos] = useState({ correo: '', contrasena: '' });
  const [loginErrores, setLoginErrores] = useState({});
  const [loginAlerta, setLoginAlerta] = useState('');
  const [loginCargando, setLoginCargando] = useState(false);
  const [mostrarPassLogin, setMostrarPassLogin] = useState(false);
  const [recordarme, setRecordarme] = useState(false);


  // ---- sign up form ----
  const [regDatos, setRegDatos] = useState({
    nombre: '', correo: '', contrasena: '', confirmar: ''
  });
  const [regErrores, setRegErrores] = useState({});
  const [regAlerta, setRegAlerta] = useState('');
  const [regCargando, setRegCargando] = useState(false);
  const [mostrarPassReg, setMostrarPassReg] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // ----- login logic -----
  const handleLoginChange = (e) => {
    setLoginDatos({ ...loginDatos, [e.target.name]: e.target.value });
    setLoginErrores({ ...loginErrores, [e.target.name]: '' });
    setLoginAlerta('');
  };


  
  const validarLogin = () => {
    const errores = {};
    if (!loginDatos.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginDatos.correo)) {
      errores.correo = 'Ingresa un correo electrónico válido';
    }
    if (!loginDatos.contrasena) {
      errores.contrasena = 'La contraseña es obligatoria';
    }
    return errores;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errores = validarLogin();
    if (Object.keys(errores).length > 0) {
      setLoginErrores(errores);
      return;
    }

    setLoginCargando(true);
    setLoginAlerta('');

    try {
      const respuesta = await iniciarSesion({
        correo: loginDatos.correo,
        contrasena: loginDatos.contrasena
      });

      // Guardamos el token y datos del usuario en localStorage
      localStorage.setItem('token', respuesta.data.token);
      localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));

      navigate('/bienvenido'); // Redirigimos al dashboard temporal
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al iniciar sesión.';
      setLoginAlerta(mensaje);
    } finally {
      setLoginCargando(false);
    }
  };

  // ============================================================
  // LÓGICA DE REGISTRO
  // ============================================================
  const handleRegChange = (e) => {
    setRegDatos({ ...regDatos, [e.target.name]: e.target.value });
    setRegErrores({ ...regErrores, [e.target.name]: '' });
    setRegAlerta('');
  };

  const validarRegistro = () => {
    const errores = {};

    if (!regDatos.nombre.trim() || regDatos.nombre.trim().length < 2) {
      errores.nombre = 'Ingresa tu nombre completo';
    }

    if (!regDatos.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regDatos.correo)) {
      errores.correo = 'Ingresa un correo electrónico válido';
    }

    const erroresPass = validarContrasena(regDatos.contrasena);
    if (erroresPass.length > 0) {
      errores.contrasena = `La contraseña debe tener: ${erroresPass.join(', ')}`;
    }

    if (regDatos.contrasena !== regDatos.confirmar) {
      errores.confirmar = 'Las contraseñas no coinciden';
    }

    if (!aceptaTerminos) {
      errores.terminos = 'Debes aceptar los términos y condiciones';
    }

    return errores;
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    const errores = validarRegistro();
    if (Object.keys(errores).length > 0) {
      setRegErrores(errores);
      return;
    }

    setRegCargando(true);
    setRegAlerta('');

    try {
      const respuesta = await registrarUsuario({
        nombre: regDatos.nombre.trim(),
        correo: regDatos.correo,
        contrasena: regDatos.contrasena
      });

      localStorage.setItem('token', respuesta.data.token);
      localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));

      navigate('/bienvenido');
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al crear la cuenta.';
      setRegAlerta(mensaje);
    } finally {
      setRegCargando(false);
    }
  };

  
  
  return (
    <div className="auth-page">

      {/* ---- LEFT SIDE ---- */}
      <section className="auth-panel-left">
        {/* Imagen de motocicleta en carretera (Unsplash, libre de uso) */}
        <img
          src="https://static.wikia.nocookie.net/esgta/images/c/c5/Freeway_SA.png/revision/latest?cb=20240116185650"
          alt="Motocicleta en carretera"
        />
        <div className="auth-logo">
          <span className="logo-icon">🏍</span>
          MotorMatch
        </div>
        <div className="overlay">
          <h1>Tu próxima aventura<br />comienza aquí.</h1>
          <p>
            {tabActivo === 'login'
              ? 'Encuentra la motocicleta perfecta que se adapte a tus preferencias.'
              : 'Únete a la comunidad y encuentra tu moto ideal.'}
          </p>
        </div>
      </section>

      {/* ----- RIGHT SIDE ----- */}
      <div className="auth-panel-right">

        {tabActivo === 'login' ? (
          <>
            <h2>Bienvenido</h2>
            <p className="auth-subtitle">Ingresa a tu cuenta para gestionar tus motos favoritas.</p>
          </>
        ) : (
          <>
            <h2>Crear Cuenta</h2>
            <p className="auth-subtitle">Regístrate para empezar a explorar el mundo de las dos ruedas.</p>
          </>
        )}

        {/* nav bar */}
        <nav className="auth-tabs">
          <button
            className={`auth-tab ${tabActivo === 'login' ? 'active' : ''}`}
            onClick={() => { setTabActivo('login'); setLoginAlerta(''); }}
          >
            Iniciar sesión
          </button>
          <button
            className={`auth-tab ${tabActivo === 'register' ? 'active' : ''}`}
            onClick={() => { setTabActivo('register'); setRegAlerta(''); }}
          >
            Registrarse
          </button>
        </nav>


        {/* ----- LOG IN form ----- */}
        {tabActivo === 'login' && (
          <form onSubmit={handleLoginSubmit} noValidate>
            {loginAlerta && <div className="alert alert-error">{loginAlerta}</div>}

            {/* email */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-correo">Correo Electronico</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  id="login-correo"
                  name="correo"
                  type="email"
                  className={`form-input ${loginErrores.correo ? 'error' : ''}`}
                  placeholder="ejemplo@motormatch.com"
                  value={loginDatos.correo}
                  onChange={handleLoginChange}
                />
              </div>
              {loginErrores.correo && <p className="field-error">{loginErrores.correo}</p>}
            </div>

            {/* password */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-pass">Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="login-pass"
                  name="contrasena"
                  type={mostrarPassLogin ? 'text' : 'password'}
                  className={`form-input ${loginErrores.contrasena ? 'error' : ''}`}
                  placeholder="Min. 10 caracteres, número, mayúscula y símbolo"
                  value={loginDatos.contrasena}
                  onChange={handleLoginChange}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setMostrarPassLogin(!mostrarPassLogin)}
                  aria-label="Mostrar u ocultar contraseña"
                >
                  {mostrarPassLogin ? '🙈' : '👁'}
                </button>
              </div>
              {loginErrores.contrasena && <p className="field-error">{loginErrores.contrasena}</p>}
            </div>

            {/* forgot password */}
            <div className="form-options-row">
              <label>
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                />
                Recordarme
              </label>
              <button
                type="button"
                className="link-orange"
                onClick={() => setMostrarModal(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" className="btn-primary" disabled={loginCargando}>
              {loginCargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        )}


        {/* ----- SIGN UP form ----- */}
        {tabActivo === 'register' && (
          <form onSubmit={handleRegSubmit} noValidate>
            {regAlerta && <div className="alert alert-error">{regAlerta}</div>}

            {/* name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-nombre">Nombre Completo</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="reg-nombre"
                  name="nombre"
                  type="text"
                  className={`form-input ${regErrores.nombre ? 'error' : ''}`}
                  placeholder="Yuliana Ocampo"
                  value={regDatos.nombre}
                  onChange={handleRegChange}
                />
              </div>
              {regErrores.nombre && <p className="field-error">{regErrores.nombre}</p>}
            </div>

            {/* email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-correo">Correo Electronico</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  id="reg-correo"
                  name="correo"
                  type="email"
                  className={`form-input ${regErrores.correo ? 'error' : ''}`}
                  placeholder="ejemplo@motormatch.com"
                  value={regDatos.correo}
                  onChange={handleRegChange}
                />
              </div>
              {regErrores.correo && <p className="field-error">{regErrores.correo}</p>}
            </div>

            {/* password */}
            <div className="form-row">
              <div>
                <label className="form-label" htmlFor="reg-pass">Contraseña</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="reg-pass"
                    name="contrasena"
                    type={mostrarPassReg ? 'text' : 'password'}
                    className={`form-input ${regErrores.contrasena ? 'error' : ''}`}
                    placeholder="Min. 10 caracteres"
                    value={regDatos.contrasena}
                    onChange={handleRegChange}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setMostrarPassReg(!mostrarPassReg)}
                    aria-label="Mostrar u ocultar contraseña"
                  >
                    {mostrarPassReg ? '🙈' : '👁'}
                  </button>
                </div>
                {regErrores.contrasena && <p className="field-error">{regErrores.contrasena}</p>}
              </div>

              <div>
                <label className="form-label" htmlFor="reg-confirm">Confirmar Contraseña</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="reg-confirm"
                    name="confirmar"
                    type={mostrarConfirm ? 'text' : 'password'}
                    className={`form-input ${regErrores.confirmar ? 'error' : ''}`}
                    placeholder="Repite tu contraseña"
                    value={regDatos.confirmar}
                    onChange={handleRegChange}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setMostrarConfirm(!mostrarConfirm)}
                    aria-label="Mostrar u ocultar confirmación"
                  >
                    {mostrarConfirm ? '🙈' : '👁'}
                  </button>
                </div>
                {regErrores.confirmar && <p className="field-error">{regErrores.confirmar}</p>}
              </div>
            </div>

            {/* terms and conditions */}
            <div className="form-checkbox-row">
              <input
                type="checkbox"
                id="terminos"
                checked={aceptaTerminos}
                onChange={(e) => {
                  setAceptaTerminos(e.target.checked);
                  setRegErrores({ ...regErrores, terminos: '' });
                }}
              />
              <label htmlFor="terminos">
                Acepto los{' '}
                <a href="#terminos" onClick={(e) => e.preventDefault()}>
                  Términos y Condiciones
                </a>{' '}
                y la Política de Privacidad de MotorMatch.
              </label>
            </div>
            {regErrores.terminos && <p className="field-error" style={{ marginTop: '-12px', marginBottom: '12px' }}>{regErrores.terminos}</p>}

            <button type="submit" className="btn-primary" disabled={regCargando}>
              {regCargando ? 'Creando...' : 'Crear Cuenta'}
            </button>
          </form>
        )}


        {/* form footer */}
        <footer className="auth-footer">
          {tabActivo === 'login' ? (
            <p>
              ¿Aún no eres parte de la comunidad?{' '}
              <button onClick={() => setTabActivo('register')}>Crea una cuenta gratis</button>
            </p>
          ) : (
            <p>
              ¿Ya tienes una cuenta?{' '}
              <button onClick={() => setTabActivo('login')}>Inicia sesión aquí</button>
            </p>
          )}
        </footer>
      </div>

      {/* show reset password modal */}
      {mostrarModal && <ForgotPasswordModal onClose={() => setMostrarModal(false)} />}
    </div>
  );
}

export default AuthPage;