// src/pages/MotoDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { formatCOP } from '../utils/format';
import '../styles/MotoDetail.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const REVIEWS_ENABLED = false;

const MotoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [moto, setMoto] = useState(null);
  const [galeria, setGaleria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChip, setActiveChip] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Consumo unificado desde el Backend Express
        const res = await fetch(`${API_URL}/bikes/${id}`);
        if (!res.ok) throw new Error(res.status === 404 ? 'Moto no encontrada' : 'Error del servidor');
        const data = await res.json();
        setMoto(data);

        // Fetch Galería desde el Backend
        const galRes = await fetch(`${API_URL}/bikes/gallery?id=${id}&marca=${data.marca}`);
        if (galRes.ok) setGaleria(await galRes.json());
      } catch (err) {
        console.error('Error MotoDetail:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="moto-detail-container">
          <div className="moto-header">
            <div className="skeleton-box" style={{ height: '400px' }}></div>
            <div className="moto-info-main">
              <div className="skeleton-box" style={{ height: '3rem', width: '70%' }}></div>
              <div className="skeleton-box" style={{ height: '1.5rem', width: '30%' }}></div>
              <div className="skeleton-box" style={{ height: '2.2rem', width: '50%' }}></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !moto) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="moto-detail-container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <h2>⚠️ {error || 'Moto no encontrada'}</h2>
          <button className="btn-compare" style={{ marginTop: '20px' }} onClick={() => navigate('/motos')}>
            Volver al garaje
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Mapeo de especificaciones usando 'anio' y resto de campos del backend
  const chips = [
    { key: 'marca', label: 'Marca', value: moto.marca, icon: 'ti-tag' },
    { key: 'cc', label: 'Cilindraje', value: `${moto.cc} cc`, icon: 'ti-engine' },
    { key: 'hp', label: 'Potencia', value: `${moto.hp} HP`, icon: 'ti-bolt' },
    { key: 'peso_kg', label: 'Peso', value: `${moto.peso_kg} kg`, icon: 'ti-weight' },
    { key: 'capacidad_combustible', label: 'Tanque', value: `${moto.capacidad_combustible} L`, icon: 'ti-droplet' },
    { key: 'altura_asiento_cm', label: 'Altura asiento', value: `${moto.altura_asiento_cm} mm`, icon: 'ti-arrows-vertical' },
    { key: 'ancho_asiento_cm', label: 'Anchura asiento', value: `${moto.ancho_asiento_cm} cm`, icon: 'ti-arrows-horizontal' },
    { key: 'transmision', label: 'Transmisión', value: moto.transmision, icon: 'ti-steering-wheel' },
  ];

  return (
    <div className="page-wrapper">
      <Header />
      <main className="moto-detail-container">
        <section className="moto-header">
          <img 
            src={moto.imagen_url || 'https://placehold.co/600x400?text=Sin+imagen'} 
            alt={moto.nombre} 
            className="moto-img-large"
            onError={e => { e.target.src = 'https://placehold.co/600x400?text=Sin+imagen'; }}
          />
          <div className="moto-info-main">
            <h1 className="moto-title">{moto.nombre}</h1>
            <div className="moto-rating">☆☆☆☆☆</div>
            <span className="moto-price-large">{formatCOP(moto.precio)}</span>
            <button className="btn-compare">Comparar</button>
          </div>
        </section>

        <section className="specs-section">
          <h2 className="section-title">Ficha técnica</h2>
          <div className="chips-container">
            {chips.map(chip => {
              const isActive = activeChip === chip.key;
              return (
                <button
                  key={chip.key}
                  onClick={() => setActiveChip(isActive ? null : chip.key)}
                  className={`spec-card ${isActive ? 'active' : ''}`}
                >
                  <i className={`ti ${chip.icon}`} />
                  <span className="spec-card-label">{chip.label}</span>
                  {isActive && <span className="spec-card-value">{chip.value}</span>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="gallery-section">
          <h2 className="section-title">Galería</h2>
          <div className="gallery-grid">
            {galeria.map(item => (
              <div key={item.id} className="gallery-item" onClick={() => navigate(`/motos/${item.id}`)}>
                <img src={item.imagen_url || 'https://placehold.co/200x120?text=Sin+imagen'} alt={item.nombre} className="gallery-img" />
                <strong>{item.nombre}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="reviews-section">
          <h2 className="section-title">Reseñas</h2>
          <div className="reviews-wrapper">
            <div className="reviews-placeholder">
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee' }}></div>
                <div style={{ flex: 1 }}>
                  <strong>Usuario</strong>
                  <div style={{ color: '#ddd' }}>☆☆☆☆☆</div>
                  <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Próximamente...</p>
                </div>
              </div>
            </div>
            <div className="placeholder-overlay">
              <i className="ti ti-clock" style={{ fontSize: '2rem' }}></i>
              <span>Pronto estará disponible este espacio</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MotoDetail;
