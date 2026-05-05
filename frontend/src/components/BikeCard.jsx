// components/BikeCard.jsx
// Tarjeta individual para mostrar una motocicleta del catálogo.

function BikeCard({ moto }) {
  const precio = moto.price
    ? `$${Number(moto.price).toLocaleString('es-CO')} COP`
    : 'Precio no disponible';

  return (
    <article className="bike-card">
      <figure className="bike-card-img">
        {moto.image_url ? (
          <img src={moto.image_url} alt={`${moto.brand} ${moto.model}`} loading="lazy" />
        ) : (
          <div className="bike-card-no-img" aria-label="Sin imagen disponible">🏍️</div>
        )}
      </figure>

      <div className="bike-card-body">
        <h3 className="bike-card-name">{moto.name}</h3>

        <ul className="bike-card-specs" aria-label="Especificaciones">
          {moto.cc && (
            <li>
              <span className="spec-label">Motor</span>
              <span className="spec-value">{moto.cc} cc</span>
            </li>
          )}
          {moto.hp && (
            <li>
              <span className="spec-label">Potencia</span>
              <span className="spec-value">{moto.hp} HP</span>
            </li>
          )}
          {moto.year && (
            <li>
              <span className="spec-label">Año</span>
              <span className="spec-value">{moto.year}</span>
            </li>
          )}
        </ul>

        <div className="bike-card-footer">
          <p className="bike-card-price">{precio}</p>
          <button className="bike-card-arrow" aria-label={`Ver ficha técnica de ${moto.name}`}>
            →
          </button>
        </div>
      </div>
    </article>
  );
}

export default BikeCard;
