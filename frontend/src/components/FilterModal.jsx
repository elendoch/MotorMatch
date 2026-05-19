// components/FilterModal.jsx
// Modal de filtros para el catálogo de motos.
// Los filtros se aplican al cerrar el modal con el botón X (onClose).
//
// Nota sobre campos del modelo Moto:
//   Se asume que la API devuelve: { precio, marca, cilindraje, transmision, ... }
//   Ajusta los nombres si difieren en tu backend.

import { useState, useEffect } from 'react';

/* ─── Constantes ─────────────────────────────────────────────── */
export const PRECIO_MIN   = 5_000_000;
export const PRECIO_MAX   = 100_000_000;
export const CC_MIN       = 50;
export const CC_MAX       = 2500;
export const TRANSMISIONES = ['Manual', 'Semi-automática', 'Automática'];

export const FILTROS_VACIOS = {
  precioMax      : PRECIO_MAX,
  marcas         : [],
  cilindrajeMax  : CC_MAX,
  transmisiones  : [],
};

/* ─── Helpers ────────────────────────────────────────────────── */
function formatCOP(valor) {
  return new Intl.NumberFormat('es-CO', {
    style                : 'currency',
    currency             : 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
}

/** Porcentaje del thumb para colorear el track del slider */
function trackPct(valor, min, max) {
  return ((valor - min) / (max - min)) * 100;
}

function sliderStyle(valor, min, max) {
  const pct = trackPct(valor, min, max);
  return {
    background: `linear-gradient(to right, var(--color-accent) ${pct}%, var(--color-border) ${pct}%)`,
  };
}

/* ─── Componente ─────────────────────────────────────────────── */
/**
 * @param {object}   props
 * @param {boolean}  props.isOpen             - Controla visibilidad del modal
 * @param {Function} props.onClose            - Recibe los filtros activos al cerrar
 * @param {string[]} props.marcasDisponibles  - Listado de marcas únicas del catálogo
 * @param {object}   props.filtrosIniciales   - Estado actual de filtros (del padre)
 */
function FilterModal({ isOpen, onClose, marcasDisponibles, filtrosIniciales }) {
  /* Estado local (borrador) — solo se sube al padre al cerrar */
  const [precioMax, setPrecioMax]         = useState(filtrosIniciales.precioMax);
  const [marcas, setMarcas]               = useState(filtrosIniciales.marcas);
  const [cilindrajeMax, setCilindrajeMax] = useState(filtrosIniciales.cilindrajeMax);
  const [transmisiones, setTransmisiones] = useState(filtrosIniciales.transmisiones);

  /* Sincroniza el borrador con el estado del padre cada vez que el modal se abre */
  useEffect(() => {
    if (isOpen) {
      setPrecioMax(filtrosIniciales.precioMax);
      setMarcas([...filtrosIniciales.marcas]);
      setCilindrajeMax(filtrosIniciales.cilindrajeMax);
      setTransmisiones([...filtrosIniciales.transmisiones]);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Al cerrar: sube el borrador al padre para aplicar los filtros */
  const handleClose = () => {
    onClose({ precioMax, marcas, cilindrajeMax, transmisiones });
  };

  /* Limpiar todo sin cerrar el modal */
  const handleLimpiar = () => {
    setPrecioMax(PRECIO_MAX);
    setMarcas([]);
    setCilindrajeMax(CC_MAX);
    setTransmisiones([]);
  };

  /* Helpers de toggle */
  const toggleMarca = (marca) =>
    setMarcas(prev =>
      prev.includes(marca) ? prev.filter(m => m !== marca) : [...prev, marca]
    );

  const toggleTransmision = (t) =>
    setTransmisiones(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );

  /* Cerrar al hacer clic en el backdrop */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop filter-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Filtros de búsqueda"
      onClick={handleBackdropClick}
    >
      <div className="modal filter-modal">

        {/* ── Encabezado ── */}
        <div className="modal-header">
          <h3>Filtros</h3>
          <p>Ajusta los criterios para encontrar tu moto ideal</p>
        </div>

        {/* Botón X — aplica los filtros al cerrar */}
        <button
          className="modal-close filter-modal-close"
          onClick={handleClose}
          aria-label="Cerrar y aplicar filtros"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* ── Cuerpo del modal ── */}
        <div className="filter-body">

          {/* ── 1. Precio máximo ── */}
          <section className="filter-section" aria-labelledby="lbl-precio">
            <div className="filter-section-header">
              <span id="lbl-precio" className="filter-label">
                <span className="material-symbols-outlined filter-icon">payments</span>
                Precio máximo
              </span>
              <span className="filter-range-value">{formatCOP(precioMax)}</span>
            </div>

            <input
              type="range"
              id="slider-precio"
              aria-label="Precio máximo"
              min={PRECIO_MIN}
              max={PRECIO_MAX}
              step={500_000}
              value={precioMax}
              onChange={e => setPrecioMax(Number(e.target.value))}
              className="filter-range"
              style={sliderStyle(precioMax, PRECIO_MIN, PRECIO_MAX)}
            />

            <div className="filter-range-limits">
              <span>{formatCOP(PRECIO_MIN)}</span>
              <span>{formatCOP(PRECIO_MAX)}</span>
            </div>
          </section>

          {/* ── 2. Marcas ── */}
          <section className="filter-section" aria-labelledby="lbl-marcas">
            <div className="filter-section-header">
              <span id="lbl-marcas" className="filter-label">
                <span className="material-symbols-outlined filter-icon">tag</span>
                Marcas
              </span>
              {marcas.length > 0 && (
                <span className="filter-count-badge">{marcas.length} seleccionada{marcas.length > 1 ? 's' : ''}</span>
              )}
            </div>

            {marcasDisponibles.length === 0 ? (
              <p className="filter-empty">No hay marcas disponibles aún.</p>
            ) : (
              <div className="filter-chips" role="group" aria-label="Marcas de motos">
                {marcasDisponibles.map(marca => (
                  <button
                    key={marca}
                    type="button"
                    className={`filter-chip ${marcas.includes(marca) ? 'active' : ''}`}
                    onClick={() => toggleMarca(marca)}
                    aria-pressed={marcas.includes(marca)}
                  >
                    {marca}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* ── 3. Cilindraje máximo ── */}
          <section className="filter-section" aria-labelledby="lbl-cc">
            <div className="filter-section-header">
              <span id="lbl-cc" className="filter-label">
                <span className="material-symbols-outlined filter-icon">speed</span>
                Cilindraje máximo
              </span>
              <span className="filter-range-value">{cilindrajeMax} cc</span>
            </div>

            <input
              type="range"
              id="slider-cc"
              aria-label="Cilindraje máximo"
              min={CC_MIN}
              max={CC_MAX}
              step={50}
              value={cilindrajeMax}
              onChange={e => setCilindrajeMax(Number(e.target.value))}
              className="filter-range"
              style={sliderStyle(cilindrajeMax, CC_MIN, CC_MAX)}
            />

            <div className="filter-range-limits">
              <span>{CC_MIN} cc</span>
              <span>{CC_MAX} cc</span>
            </div>
          </section>

          {/* ── 4. Transmisión ── */}
          <section className="filter-section" aria-labelledby="lbl-trans">
            <div className="filter-section-header">
              <span id="lbl-trans" className="filter-label">
                <span className="material-symbols-outlined filter-icon">settings</span>
                Tipo de transmisión
              </span>
              {transmisiones.length > 0 && (
                <span className="filter-count-badge">{transmisiones.length} seleccionada{transmisiones.length > 1 ? 's' : ''}</span>
              )}
            </div>

            <div className="filter-chips" role="group" aria-label="Tipos de transmisión">
              {TRANSMISIONES.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`filter-chip ${transmisiones.includes(t) ? 'active' : ''}`}
                  onClick={() => toggleTransmision(t)}
                  aria-pressed={transmisiones.includes(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* ── Footer del modal ── */}
        <div className="filter-modal-footer">
          <button
            type="button"
            className="filter-clear-btn"
            onClick={handleLimpiar}
          >
            <span className="material-symbols-outlined">restart_alt</span>
            Limpiar filtros
          </button>

          <button
            type="button"
            className="filter-apply-btn"
            onClick={handleClose}
          >
            <span className="material-symbols-outlined">check</span>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
