// src/pages/Garaje.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MotoCard from '../components/MotoCard';
import '../styles/Garaje.css';

// Usamos la variable de entorno para la URL de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Garaje = () => {
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        // Unificación: Consumimos el backend Express, NO Supabase directo
        const res = await fetch(`${API_URL}/bikes`);
        
        if (!res.ok) {
          throw new Error('Error al conectar con el servidor');
        }

        const data = await res.json();
        setMotos(data || []);
      } catch (err) {
        console.error('Error cargando motos:', err);
        setError('No se pudieron cargar las motos. Asegúrate de que el backend esté corriendo.');
      } finally {
        setLoading(false);
      }
    };

    fetchBikes();
  }, []);

  return (
    <div className="page-wrapper">
      <Header />
      <main className="garaje-container">
        <h1 className="garaje-title">Nuestro Garaje</h1>
        <p className="garaje-subtitle">Explora todas las motos disponibles</p>

        {loading && (
          <div className="garaje-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bike-card skeleton-card">
                <div style={{ height: '200px', background: '#eee', borderRadius: '12px' }} />
                <div style={{ height: '16px', background: '#eee', borderRadius: '8px', margin: '12px 0 8px' }} />
                <div style={{ height: '12px', background: '#eee', borderRadius: '8px', width: '60%' }} />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
            <p>⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-retry"
              style={{
                marginTop: '1rem',
                padding: '10px 24px',
                background: '#1B2A4A',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && motos.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6B7280', marginTop: '2rem' }}>
            No hay motos disponibles por el momento.
          </p>
        )}

        {!loading && !error && motos.length > 0 && (
          <div className="garaje-grid">
            {motos.map(moto => (
              <MotoCard key={moto.id} {...moto} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Garaje;
