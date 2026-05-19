// src/components/MotoCard.jsx
// Cambios respecto a versión anterior:
//   - Botón "Comparar": coloca la moto como primera casilla en localStorage
//     y redirige directamente a /comparar, en lugar de gestionar una lista inline.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCOP } from '../utils/format';
import api from '../services/api';

// ── Helper: prepara la moto como primera selección y navega a /comparar ──
function iniciarComparacion(id, navigate) {
  localStorage.setItem('compare_ids', JSON.stringify([id]));
  window.dispatchEvent(new Event('compare_updated'));
  navigate('/comparar');
}

const MotoCard = ({
  id,
  nombre,
  marca,
  imagen_url,
  cc,
  hp,
  anio,
  precio,
  esFavorito: initialFavorito = false,
}) => {
  const navigate = useNavigate();

  /* ── Estado favorito ── */
  const [esFavorito, setEsFavorito]   = useState(initialFavorito);
  const [cargandoFav, setCargandoFav] = useState(false);

  useEffect(() => { setEsFavorito(initialFavorito); }, [initialFavorito]);

  /* ── Handler comparar: redirige a /comparar con esta moto como primera casilla ── */
  const handleComparar = (e) => {
    e.stopPropagation();
    iniciarComparacion(id, navigate);
  };

  /* ── Toggle favorito ── */
  const handleFavorito = async (e) => {
    e.stopPropagation();
    if (cargandoFav) return;
    const nuevoEstado = !esFavorito;
    setEsFavorito(nuevoEstado);
    setCargandoFav(true);
    try {
      if (nuevoEstado) { await api.post(`/favorites/${id}`); }
      else             { await api.delete(`/favorites/${id}`); }
    } catch (err) {
      setEsFavorito(!nuevoEstado);
      if ([401, 403].includes(err.response?.status)) navigate('/');
      else console.error('Error favorito:', err);
    } finally {
      setCargandoFav(false);
    }
  };

  return (
    <article className="bike-card">
      <div className="bike-card-img">
        <img
          src={imagen_url || 'https://placehold.co/400x220?text=Sin+imagen'}
          alt={nombre || 'Motocicleta'}
          loading="lazy"
          decoding="async"
          onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x220?text=Sin+imagen'; }}
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/motos/${id}`)}
        />
      </div>

      <div className="bike-card-body">
        {/* Cabecera: nombre + favorito + comparar */}
        <div className="bike-card-header">
          <h3 className="bike-card-name">{nombre || '—'}</h3>

          {/* Botón comparar */}
          <button
            className="bike-card-arrow bike-card-compare"
            onClick={handleComparar}
            title="Comparar esta moto"
            aria-label={`Comparar ${nombre}`}
          >
            <span className="material-symbols-outlined tune-icon">compare_arrows</span>
          </button>

          {/* Botón favorito */}
          <button
            className={`bike-card-arrow bike-card-fav ${esFavorito ? 'active' : ''}`}
            onClick={handleFavorito}
            disabled={cargandoFav}
            title={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-label={`${esFavorito ? 'Quitar' : 'Agregar'} ${nombre} ${esFavorito ? 'de' : 'a'} favoritos`}
            aria-pressed={esFavorito}
          >
            <span className="material-symbols-outlined tune-icon">
              {esFavorito ? 'favorite' : 'favorite_border'}
            </span>
          </button>
        </div>

        {/* Especificaciones */}
        <ul className="bike-card-specs">
          <li>
            <span className="spec-label">Motor</span>
            <span className="spec-value">{cc ? `${cc} cc` : '—'}</span>
          </li>
          <li>
            <span className="spec-label">Potencia</span>
            <span className="spec-value">{hp ? `${hp} HP` : '—'}</span>
          </li>
          <li>
            <span className="spec-label">Año</span>
            <span className="spec-value">{anio || '—'}</span>
          </li>
        </ul>

        {/* Footer: precio + ver detalle */}
        <footer className="bike-card-footer">
          <span className="bike-card-price">
            {precio ? formatCOP(precio) : 'Precio no disponible'}
          </span>
          <button
            className="bike-card-arrow"
            onClick={() => navigate(`/motos/${id}`)}
            aria-label={`Ver detalles de ${nombre}`}
          >
            <span className="material-symbols-outlined tune-icon">arrow_forward_ios</span>
          </button>
        </footer>
      </div>
    </article>
  );
};

export default MotoCard;
