// pages/Perfil.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Perfil.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const formatCOP = (n) => n ? `$${Number(n).toLocaleString('es-CO')} COP` : '—';

const TIPO_USO_LABELS = {
  ciudad: '🏙️ Ciudad',
  carretera: '🏁 Carretera',
  trabajo: '💼 Trabajo',
  'off-road': '🏞️ Off-road',
  'off road': '🏞️ Off-road',
  deporte: '⚡ Deporte',
};

const Perfil = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [modalMoto, setModalMoto] = useState(false);
  const [catalogo, setCatalogo] = useState([]);
  const [search, setSearch] = useState('');

  // Auth: Opción C (localStorage o sessionStorage)
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
        nombre: json.usuario.nombre,
        correo: json.usuario.correo,
        apodo: json.usuario.apodo || '',
        telefono: json.usuario.telefono || '',
        ciudad: json.usuario.ciudad || '',
        foto_url: json.usuario.foto_url || ''
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
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
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` }
        });
        setCatalogo(await res.json());
      };
      const t = setTimeout(fetchMotos, 300);
      return () => clearTimeout(t);
    }
  }, [modalMoto, search]);

  if (loading) return <div className="mm-perfil-page">Cargando perfil...</div>;
  if (error) return <div className="mm-perfil-page">⚠️ Error: {error}</div>;

  const { usuario, motoPersonal, cuestionarioCompletado, preferencias } = data;

  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="mm-perfil-page">
        {/* Header estilo Figma */}
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
             <button className="mia-btn">MIA</button>
          </div>
          <div className="header-user-greeting">
            <span>Hola, {usuario.nombre?.split(' ')[0]}</span>
            <div className="header-avatar-circle">
              {usuario.foto_url ? <img src={usuario.foto_url} alt="A" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} /> : (usuario.nombre?.[0] || 'U')}
            </div>
          </div>
        </div>

        <div className="dashboard-layout">
          {/* IZQUIERDA */}
          <aside className="sidebar-column">
            
            {/* Perfil */}
            <section className="mm-card mm-profile-card">
              <div className="avatar-large-container">
                <img src={usuario.foto_url || 'https://i.pravatar.cc/150?u=' + usuario.id} alt="Avatar" />
              </div>
              {!editando ? (
                <>
                  <h2 className="mm-nombre">{usuario.nombre}</h2>
                  <span className="mm-ciudad-label">{usuario.ciudad || 'Sin ciudad'}</span>
                  <button className="btn-blue-dark" onClick={() => setEditando(true)}>Editar usuario</button>
                </>
              ) : (
                <div className="edit-form-grid" style={{width: '100%'}}>
                  <input className="mm-input" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                  <input className="mm-input" placeholder="Correo" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} />
                  <input className="mm-input" placeholder="Apodo" value={form.apodo} onChange={e => setForm({...form, apodo: e.target.value})} />
                  <input className="mm-input" placeholder="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
                  <input className="mm-input" placeholder="Ciudad" value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} />
                  <input className="mm-input" placeholder="URL Foto" value={form.foto_url} onChange={e => setForm({...form, foto_url: e.target.value})} />
                  <button className="btn-blue-dark" onClick={handleSave} disabled={guardando}>{guardando ? '...' : 'Guardar'}</button>
                  <button className="btn-blue-dark" style={{background: '#666'}} onClick={() => setEditando(false)}>Cancelar</button>
                </div>
              )}
            </section>

            {/* Moto Personal */}
            <section className="mm-card moto-personal-card">
              <h3 className="mm-card-title" style={{color: 'var(--mm-orange)', fontSize: '1.4rem'}}>Moto personal</h3>
              <img src={motoPersonal?.imagen || 'https://via.placeholder.com/200x120?text=Selecciona+tu+Moto'} alt="Moto" className="moto-img-display" />
              <div className="moto-info-row">
                <div>
                  <span className="label-small">Marca</span>
                  <span className="value-bold" style={{fontSize: '1.5rem', display:'block'}}>{motoPersonal?.marca || '—'}</span>
                  <span className="value-bold" style={{display:'block'}}>{motoPersonal?.nombre || 'Nombre'}</span>
                  <span className="label-small">Año</span>
                  <span className="value-bold" style={{fontSize: '1.2rem'}}>{motoPersonal?.anio || '—'}</span>
                </div>
              </div>
              <div className="actions-row">
                <button className="btn-blue-dark" style={{flex: 1}} onClick={() => setModalMoto(true)}>Actualizar</button>
                <button className="btn-circle-arrow">→</button>
              </div>
            </section>

            {/* Estadísticas */}
            <section className="mm-card">
              <h2 className="mm-card-title" style={{textAlign: 'center'}}>Estadísticas</h2>
              <div style={{
                height: '100px', 
                border: '2px solid #ddd', 
                borderRadius: '20px', 
                display:'flex', 
                alignItems:'center', 
                justifyContent:'center',
                textAlign: 'center',
                padding: '20px'
              }}>
                <p style={{color: '#999', fontSize: '0.9rem', fontWeight: '600'}}>
                  Pronto podrás acceder a tus estadísticas
                </p>
              </div>
            </section>
          </aside>

          {/* DERECHA */}
          <div className="main-column">
            
            {/* Preferencias */}
            <section className="mm-card">
              <div className="fav-header">
                <h2 className="mm-card-title">Preferencias</h2>
                {cuestionarioCompletado && (
                  <button className="btn-garaje" onClick={() => window.location.href='/inicio'}>Actualizar</button>
                )}
              </div>
              
              {!cuestionarioCompletado ? (
                <div style={{textAlign:'center', padding:'20px'}}>
                   <span style={{fontSize:'2.5rem', display:'block', marginBottom:'10px'}}>📋</span>
                   <p style={{fontWeight:'700', color: 'var(--mm-blue)'}}>Aún no has realizado el cuestionario de preferencias</p>
                   <p style={{fontSize:'0.9rem', color: '#888', marginBottom:'15px'}}>Complétalo para recomendarte las mejores motos</p>
                   <button className="btn-blue-dark" onClick={() => window.location.href='/inicio'}>
                     Realizar Cuestionario Ahora
                   </button>
                </div>
              ) : (
                <div className="prefs-grid">
                  <div className="pref-box">
                    <span className="pref-icon-img">$</span>
                    <span className="pref-label-figma">{formatCOP(preferencias.presupuesto)}</span>
                    <span className="label-small">Presupuesto</span>
                  </div>
                  <div className="pref-box">
                    <span className="pref-icon-img">🏠</span>
                    <span className="pref-label-figma">{TIPO_USO_LABELS[preferencias.tipoUso?.toLowerCase()] || preferencias.tipoUso}</span>
                    <span className="label-small">Uso</span>
                  </div>
                  <div className="pref-box">
                    <span className="pref-icon-img">⚡</span>
                    <span className="pref-label-figma">{preferencias.categoriaPeso}</span>
                    <span className="label-small">Peso ideal</span>
                  </div>
                  <div className="pref-box">
                    <span className="pref-icon-img">⚙️</span>
                    <span className="pref-label-figma">{preferencias.transmision}</span>
                    <span className="label-small">Transmisión</span>
                  </div>
                </div>
              )}
            </section>

            {/* Favoritas */}
            <section className="mm-card">
              <div className="fav-header">
                <h2 className="mm-card-title">Motos favoritas</h2>
                <a href="/inicio" className="btn-garaje">Ir al garaje</a>
              </div>
              <div className="fav-list">
                 <p style={{color: '#999', fontSize: '0.9rem', padding: '10px'}}>
                   Próximamente podrás guardar tus motos favoritas
                 </p>
              </div>
            </section>

            {/* Actividad */}
            <section className="mm-card">
              <h2 className="mm-card-title">Actividad reciente</h2>
              <div style={{height: '100px', border: '2px solid #ddd', borderRadius: '20px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <p style={{color: '#999', fontSize: '0.9rem'}}>Pronto esta función estará disponible</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Modal Catálogo */}
      {modalMoto && (
        <div className="mm-modal-overlay" onClick={() => setModalMoto(false)}>
          <div className="mm-modal" onClick={e => e.stopPropagation()}>
            <div className="mm-modal-header">
              <h3 style={{color: 'var(--mm-blue)', fontWeight: '800'}}>Seleccionar Moto Personal</h3>
              <button style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}} onClick={() => setModalMoto(false)}>✕</button>
            </div>
            <input 
              className="mm-input" 
              placeholder="Buscar por marca o modelo..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              autoFocus
            />
            <div className="mm-catalogo-grid" style={{marginTop: '20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', maxHeight:'400px', overflowY:'auto'}}>
              {catalogo.length === 0 ? <p>No se encontraron resultados</p> : catalogo.map(moto => (
                <div key={moto.id} className="mm-moto-card" onClick={() => handleSelectMoto(moto.id)} style={{border:'1px solid #ddd', padding:'10px', borderRadius:'12px', cursor:'pointer'}}>
                  <img src={moto.image_url} alt={moto.name} style={{width:'100%', height:'80px', objectFit:'contain'}} />
                  <p style={{fontSize:'0.9rem', fontWeight:'700', marginTop:'5px'}}>{moto.brand} {moto.model}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Perfil;
