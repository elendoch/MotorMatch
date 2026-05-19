import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/user-profile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const formatCOP = (n) => n ? `$${Number(n).toLocaleString('es-CO')} COP` : '—';

const TIPO_USO_LABELS = {
  ciudad:     'Ciudad',
  carretera:  'Carretera',
  trabajo:    'Trabajo',
  'off-road': 'Off-road',
  'off road': 'Off-road',
  deporte:    'Deporte',
};

/* Mapa de íconos dinámicos según el tipo de uso */
const TIPO_USO_ICONS = {
  ciudad:     'location_city',
  carretera:  'road',
  trabajo:    'work',
  'off-road': 'nature',
  'off road': 'nature',
  deporte:    'sports_motorsports',
};

const getUsoIcon = (tipoUso) =>
  TIPO_USO_ICONS[tipoUso?.toLowerCase()] || 'two_wheeler';

const UserProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [modalMoto, setModalMoto] = useState(false);
  const [catalogo, setCatalogo] = useState([]);
  const [search, setSearch] = useState('');

  const usuarioRaw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  const usuarioLocal = JSON.parse(usuarioRaw || '{}');
  const userId = usuarioLocal.id;

  const cargarPerfil = useCallback(async () => {
    if (!userId) { setError('No hay sesión activa'); setLoading(false); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API_URL}/usuarios/${userId}/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo cargar el perfil');
      const json = await res.json();
      setData(json);
      setForm({
        nombre:   json.usuario.nombre,
        correo:   json.usuario.correo,
        apodo:    json.usuario.apodo    || '',
        telefono: json.usuario.telefono || '',
        ciudad:   json.usuario.ciudad   || '',
        foto_url: json.usuario.foto_url || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { cargarPerfil(); }, [cargarPerfil]);

  const handleSave = async () => {
    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/${userId}/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al guardar');
      const updatedUser = { ...usuarioLocal, nombre: form.nombre, correo: form.correo };
      if (localStorage.getItem('usuario')) {
        localStorage.setItem('usuario', JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem('usuario', JSON.stringify(updatedUser));
      }
      setEditando(false);
      cargarPerfil();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleSelectMoto = async (motoId) => {
    try {
      await fetch(`${API_URL}/usuarios/${userId}/moto-personal`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify({ moto_id: motoId }),
      });
      setModalMoto(false);
      cargarPerfil();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (modalMoto) {
      const fetchMotos = async () => {
        const res = await fetch(`${API_URL}/catalogo/motos?search=${search}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
        });
        setCatalogo(await res.json());
      };
      const t = setTimeout(fetchMotos, 300);
      return () => clearTimeout(t);
    }
  }, [modalMoto, search]);

  if (loading) return <div className="mm-perfil-page">Cargando perfil...</div>;
  if (error)   return <div className="mm-perfil-page">⚠️ Error: {error}</div>;

  const { usuario, motoPersonal, cuestionarioCompletado, preferencias } = data;

  /* Peso exacto guardado en el cuestionario */
  const pesoExacto = preferencias?.pesoMoto || preferencias?.peso_moto;

  return (
    <div className="page-wrapper">
      <Header />

      <main className="mm-perfil-page">
        <div className="dashboard-layout">

          {/* ── IZQUIERDA ── */}
          <aside className="sidebar-column">

            {/* Perfil */}
            <section className="page-card mm-profile-card">
              <div className="avatar-large-container">
                <img
                  src={usuario.foto_url || `https://i.pravatar.cc/150?u=${usuario.id}`}
                  alt="Avatar"
                />
              </div>

              {!editando ? (
                <>
                  <h2 className="mm-nombre">{usuario.nombre}</h2>
                  <span className="mm-ciudad-label">{usuario.ciudad || 'Sin ciudad'}</span>
                  <button className="btn-blue-dark" onClick={() => setEditando(true)}>
                    Editar usuario
                  </button>
                </>
              ) : (
                <div className="edit-form-grid">
                  <input className="mm-input" placeholder="Nombre"    value={form.nombre}   onChange={e => setForm({ ...form, nombre:   e.target.value })} />
                  <input className="mm-input" placeholder="Correo"    value={form.correo}   onChange={e => setForm({ ...form, correo:   e.target.value })} />
                  <input className="mm-input" placeholder="Apodo"     value={form.apodo}    onChange={e => setForm({ ...form, apodo:    e.target.value })} />
                  <input className="mm-input" placeholder="Teléfono"  value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                  <input className="mm-input" placeholder="Ciudad"    value={form.ciudad}   onChange={e => setForm({ ...form, ciudad:   e.target.value })} />
                  <input className="mm-input" placeholder="URL Foto"  value={form.foto_url} onChange={e => setForm({ ...form, foto_url: e.target.value })} />
                  <button className="btn-blue-dark" onClick={handleSave} disabled={guardando}>
                    {guardando ? '...' : 'Guardar'}
                  </button>
                  <button className="btn-blue-dark btn-cancel" onClick={() => setEditando(false)}>
                    Cancelar
                  </button>
                </div>
              )}
            </section>

            {/* Moto personal */}
            <section className="page-card moto-personal-card">
              <h3 className="mm-card-title mm-card-title--accent">Moto personal</h3>
              <img
                src={motoPersonal?.imagen || 'https://via.placeholder.com/200x120?text=Selecciona+tu+Moto'}
                alt="Moto"
                className="moto-img-display"
              />
              <div className="moto-info-row">
                <div>
                  <span className="label-small">Marca</span>
                  <span className="value-bold value-bold--lg">{motoPersonal?.marca || '—'}</span>
                  <span className="value-bold">{motoPersonal?.nombre || 'Nombre'}</span>
                  <span className="label-small">Año</span>
                  <span className="value-bold value-bold--md">{motoPersonal?.anio || '—'}</span>
                </div>
              </div>
              <div className="actions-row">
                <button className="btn-blue-dark actions-row__update" onClick={() => setModalMoto(true)}>
                  Actualizar
                </button>
                <button className="btn-circle-arrow">→</button>
              </div>
            </section>

            {/* Estadísticas */}
            <section className="page-card">
              <h2 className="mm-card-title" style={{ textAlign: 'center' }}>Estadísticas</h2>
              <div className="placeholder-box">
                <p>Pronto podrás acceder a tus estadísticas</p>
              </div>
            </section>
          </aside>

          {/* ── DERECHA ── */}
          <div className="main-column">

            {/* Preferencias */}
            <section className="page-card">
              <div className="fav-header">
                <h2 className="mm-card-title">Preferencias</h2>
                {cuestionarioCompletado && (
                  <button className="btn-garaje" onClick={() => window.location.href = '/survey'}>
                    Actualizar
                  </button>
                )}
              </div>

              {!cuestionarioCompletado ? (
                <div className="empty-state">
                  <span className="empty-state__icon">📋</span>
                  <p className="empty-state__title">Aún no has realizado el cuestionario de preferencias</p>
                  <p className="empty-state__sub">Complétalo para recomendarte las mejores motos</p>
                  <button className="btn-blue-dark" onClick={() => window.location.href = '/inicio'}>
                    Realizar Cuestionario Ahora
                  </button>
                </div>
              ) : (
                <div className="prefs-grid">

                  {/* Presupuesto */}
                  <div className="pref-box">
                    <span className="material-symbols-outlined pref-icon">attach_money</span>
                    <span className="pref-value">{formatCOP(preferencias.presupuesto)}</span>
                    <span className="pref-label">Presupuesto</span>
                  </div>

                  {/* Tipo de uso — ícono dinámico */}
                  <div className="pref-box">
                    <span className="material-symbols-outlined pref-icon">
                      {getUsoIcon(preferencias.tipoUso)}
                    </span>
                    <span className="pref-value">
                      {TIPO_USO_LABELS[preferencias.tipoUso?.toLowerCase()] || preferencias.tipoUso}
                    </span>
                    <span className="pref-label">Uso</span>
                  </div>

                  {/* Peso ideal + peso exacto */}
                  <div className="pref-box">
                    <span className="material-symbols-outlined pref-icon">weight</span>
                    <span className="pref-value">
                      {pesoExacto ? `${pesoExacto} kg` : preferencias.categoriaPeso}
                    </span>
                    <span className="pref-label">Peso ideal</span>
                  </div>

                  {/* Transmisión */}
                  <div className="pref-box">
                    <span className="material-symbols-outlined pref-icon">settings</span>
                    <span className="pref-value">{preferencias.transmision}</span>
                    <span className="pref-label">Transmisión</span>
                  </div>

                </div>
              )}
            </section>

            {/* Favoritas */}
            <section className="page-card">
              <div className="fav-header">
                <h2 className="mm-card-title">Motos favoritas</h2>
                <a href="/inicio" className="btn-garaje">Ir al garaje</a>
              </div>
              <div className="fav-list">
                <p className="coming-soon">Próximamente podrás guardar tus motos favoritas</p>
              </div>
            </section>

            {/* Actividad */}
            <section className="page-card">
              <h2 className="mm-card-title">Actividad reciente</h2>
              <div className="placeholder-box">
                <p>Pronto esta función estará disponible</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Modal catálogo */}
      {modalMoto && (
        <div className="mm-modal-overlay" onClick={() => setModalMoto(false)}>
          <div className="mm-modal" onClick={e => e.stopPropagation()}>
            <div className="mm-modal-header">
              <h3 className="mm-modal-title">Seleccionar Moto Personal</h3>
              <button className="mm-modal-close" onClick={() => setModalMoto(false)}>✕</button>
            </div>
            <input
              className="mm-input"
              placeholder="Buscar por marca o modelo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            <div className="mm-catalogo-grid">
              {catalogo.length === 0
                ? <p>No se encontraron resultados</p>
                : catalogo.map(moto => (
                  <div
                    key={moto.id}
                    className="mm-moto-card"
                    onClick={() => handleSelectMoto(moto.id)}
                  >
                    <img src={moto.image_url} alt={moto.name} className="mm-moto-card__img" />
                    <p className="mm-moto-card__name">{moto.brand} {moto.model}</p>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UserProfile;
