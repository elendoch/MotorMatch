// src/components/MotoCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCOP } from '../utils/format';

const MotoCard = ({ id, nombre, marca, imagen_url, cc, hp, anio, precio }) => {
  const navigate = useNavigate();

  return (
    <article className="bike-card">

      {/* Imagen de la moto */}
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

        {/* Cabecera: nombre + botón favorito
            align-items: center garantiza alineación vertical correcta */}
        <div className="bike-card-header">
          <h3 className="bike-card-name">{nombre || '—'}</h3>
          <button
            className="bike-card-arrow bike-card-fav"
            title="Agregar a favoritos"
            aria-label={`Agregar ${nombre} a favoritos`}
          >
            <span className="material-symbols-outlined tune-icon">favorite</span>
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

        {/* Footer: precio + botón de detalle */}
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
