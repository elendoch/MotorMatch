// src/pages/ComparePage.jsx
// Página de comparación de motos (hasta 4).
// Lee los IDs desde localStorage ('compare_ids'), los fetcha,
// ejecuta el modelo de puntuación y resalta los resultados.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import { formatCOP } from '../utils/format';
import '../styles/compare.css';

const MAX_MOTOS = 4;

// ── Configuración de filas de la tabla ─────────────────────
// type: 'scored'      → verde/rojo/gris según modelo
//       'mayor-menor' → etiqueta Mayor/Menor
//       'neutral'     → solo muestra el valor
const FILAS = [
  { key: 'precio',                label: 'Precio',              unit: '',     type: 'scored',      higherBetter: false, format: 'cop'   },
  { key: 'cc',                    label: 'Cilindraje',          unit: ' cc',  type: 'scored',      higherBetter: true,  format: 'num'   },
  { key: 'hp',                    label: 'Potencia',            unit: ' HP',  type: 'scored',      higherBetter: true,  format: 'num'   },
  { key: 'capacidad_combustible', label: 'Tanque',              unit: ' L',   type: 'scored',      higherBetter: true,  format: 'num'   },
  { key: 'peso_kg',               label: 'Peso',                unit: ' kg',  type: 'mayor-menor', format: 'num'   },
  { key: 'altura_asiento_cm',     label: 'Altura del asiento',  unit: ' cm',  type: 'mayor-menor', format: 'num'   },
  { key: 'ancho_asiento_cm',      label: 'Anchura del asiento', unit: ' cm',  type: 'mayor-menor', format: 'num'   },
  { key: 'transmision',           label: 'Transmisión',         unit: '',     type: 'neutral',     format: 'text'  },
];

// ── Utilidades de formato ───────────────────────────────────
function fmtValor(fila, bike) {
  const v = bike[fila.key];
  if (v == null || v === '') return '—';
  if (fila.format === 'cop') return formatCOP(v);
  if (fila.format === 'text') {
    const traducciones = { manual: 'Manual', automatic: 'Automática', 'semi-automatic': 'Semi-automática' };
    return traducciones[v] ?? v;
  }
  return `${Number(v).toLocaleString('es-CO')}${fila.unit}`;
}

// ── Lógica de highlight para variables scored ───────────────
// Retorna: 'cell-best' | 'cell-worst' | 'cell-tie' | ''
function getHighlight(fila, bike, motas) {
  if (fila.type !== 'scored') return '';

  const nums = motas.map(b => Number(b[fila.key])).filter(n => !isNaN(n) && n >= 0);
  const myVal = Number(bike[fila.key]);
  if (isNaN(myVal) || nums.length < 2) return '';

  const max = Math.max(...nums);
  const min = Math.min(...nums);
  if (max === min) return ''; // todas iguales → sin resaltar

  const cntMax = nums.filter(n => n === max).length;
  const cntMin = nums.filter(n => n === min).length;

  if (fila.higherBetter) {
    if (myVal === max) return cntMax === 1 ? 'cell-best' : 'cell-tie';
    if (myVal === min) return cntMin === 1 ? 'cell-worst' : 'cell-tie';
  } else {
    // precio: menor es mejor
    if (myVal === min) return cntMin === 1 ? 'cell-best' : 'cell-tie';
    if (myVal === max) return cntMax === 1 ? 'cell-worst' : 'cell-tie';
  }
  return '';
}

// ── Etiqueta Mayor / Menor para variables no scored ─────────
function getMayorMenor(fila, bike, motas) {
  if (fila.type !== 'mayor-menor') return null;

  const nums = motas
    .map(b => ({ id: b.id, v: Number(b[fila.key]) }))
    .filter(x => !isNaN(x.v) && x.v > 0);

  if (nums.length < 2) return null;

  const max = Math.max(...nums.map(x => x.v));
  const min = Math.min(...nums.map(x => x.v));
  if (max === min) return null;

  const myVal = Number(bike[fila.key]);
  const cntMax = nums.filter(x => x.v === max).length;
  const cntMin = nums.filter(x => x.v === min).length;

  if (myVal === max && cntMax === 1) return 'mayor';
  if (myVal === min && cntMin === 1) return 'menor';
  return null;
}

// ── Modelo de puntuación ────────────────────────────────────
function normalize(arr) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  if (max === min) return arr.map(() => 0.5);
  return arr.map(v => (v - min) / (max - min));
}

function computeScores(motas) {
  if (motas.length < 2) return motas.map(() => null);

  const hp    = motas.map(b => Number(b.hp)                    || 0);
  const cc    = motas.map(b => Number(b.cc)                    || 0);
  const tank  = motas.map(b => Number(b.capacidad_combustible) || 0);
  const price = motas.map(b => Number(b.precio)                || 0);

  const vratio = motas.map((_, i) => price[i] > 0 ? hp[i] / price[i] : 0);

  const nHP   = normalize(hp);
  const nCC   = normalize(cc);
  const nTank = normalize(tank);
  const nVR   = normalize(vratio);

  return motas.map((_, i) =>
    0.45 * nHP[i] +
    0.25 * nCC[i] +
    0.15 * nTank[i] +
    0.15 * nVR[i]
  );
}

// ── Gestión de IDs en localStorage ─────────────────────────
export function getCompareIds() {
  try { return JSON.parse(localStorage.getItem('compare_ids') || '[]'); }
  catch { return []; }
}
export function setCompareIds(ids) {
  localStorage.setItem('compare_ids', JSON.stringify(ids));
  window.dispatchEvent(new Event('compare_updated'));
}

// ── Componente principal ────────────────────────────────────
function ComparePage() {
  const navigate = useNavigate();

  const [bikeIds, setBikeIds]     = useState(getCompareIds);
  const [motas, setMotas]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  // Modal para añadir moto
  const [showModal, setShowModal]     = useState(false);
  const [allMotas, setAllMotas]       = useState([]);
  const [modalSearch, setModalSearch] = useState('');
  const [loadingModal, setLoadingModal] = useState(false);

  // Escucha cambios externos de localStorage (desde MotoCard)
  useEffect(() => {
    const sync = () => setBikeIds(getCompareIds());
    window.addEventListener('compare_updated', sync);
    return () => window.removeEventListener('compare_updated', sync);
  }, []);

  // Fetch de cada moto por ID
  useEffect(() => {
    if (bikeIds.length === 0) { setMotas([]); return; }
    setLoading(true);
    setError(null);
    Promise.all(bikeIds.map(id => api.get(`/bikes/${id}`).then(r => r.data)))
      .then(data => setMotas(data))
      .catch(() => setError('No se pudieron cargar las motos. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, [bikeIds]);

  // Cargar catálogo completo para el modal
  const abrirModal = useCallback(async () => {
    setShowModal(true);
    setModalSearch('');
    if (allMotas.length > 0) return; // ya cargado
    setLoadingModal(true);
    try {
      const { data } = await api.get('/bikes');
      setAllMotas(data);
    } catch { /* silencioso */ }
    finally { setLoadingModal(false); }
  }, [allMotas.length]);

  const eliminarMoto = (id) => {
    const nuevos = bikeIds.filter(x => x !== id);
    setBikeIds(nuevos);
    setCompareIds(nuevos);
  };

  const agregarMoto = (id) => {
    if (bikeIds.includes(id) || bikeIds.length >= MAX_MOTOS) return;
    const nuevos = [...bikeIds, id];
    setBikeIds(nuevos);
    setCompareIds(nuevos);
    setShowModal(false);
  };

  const limpiarTodo = () => {
    setBikeIds([]);
    setCompareIds([]);
    setMotas([]);
  };

  // Puntuaciones y ganadora
  const scores  = computeScores(motas);
  const maxScore = scores.length >= 2 ? Math.max(...scores) : -1;
  // Ganadora: única con puntuación máxima
  const winnerIdx = scores.length >= 2 && scores.filter(s => s === maxScore).length === 1
    ? scores.indexOf(maxScore)
    : -1;

  // Motos filtradas del modal
  const motasFiltradas = allMotas.filter(m =>
    !bikeIds.includes(m.id) &&
    `${m.nombre} ${m.marca} ${m.modelo}`.toLowerCase().includes(modalSearch.toLowerCase())
  );

  const slotsVacios = MAX_MOTOS - motas.length;

  return (
    <div className="page-wrapper">
      <Header />

      <main className="compare-page">

        {/* ── Encabezado ── */}
        <div className="compare-page-header">
          <div>
            <h1 className="compare-title">
              BATALLA A <span className="compare-title-accent">DOS RUEDAS</span>
            </h1>
            <p className="compare-subtitle">
              Compara hasta {MAX_MOTOS} motos y descubre cuál se ajusta mejor a tus preferencias.
            </p>
          </div>
          <button className="compare-clear-btn" onClick={limpiarTodo}>
            <span className="material-symbols-outlined tune-icon">delete_sweep</span>
            Limpiar comparación
          </button>
        </div>

        {/* ── Estado vacío ── */}
        {bikeIds.length === 0 && !loading && (
          <div className="compare-empty">
            <span className="material-symbols-outlined compare-empty-icon">compare_arrows</span>
            <p>Aún no has añadido motos a la comparación.</p>
            <button className="compare-add-first-btn" onClick={abrirModal}>
              <span className="material-symbols-outlined tune-icon">add_circle</span>
              Añadir moto
            </button>
          </div>
        )}

        {loading && <p className="compare-status">Cargando motos...</p>}
        {error   && <p className="compare-status compare-status-error">{error}</p>}

        {/* ── Tabla de comparación ── */}
        {!loading && motas.length > 0 && (
          <div className="compare-wrapper">
            <div
              className="compare-table"
              style={{ gridTemplateColumns: `180px repeat(${motas.length + (slotsVacios > 0 ? 1 : 0)}, 1fr)` }}
            >

              {/* ── Fila de encabezado: imágenes ── */}
              <div className="compare-cell compare-label-header" />

              {motas.map((moto, i) => (
                <div
                  key={moto.id}
                  className={`compare-cell compare-bike-header ${i === winnerIdx ? 'compare-winner-col' : ''}`}
                >
                  {i === winnerIdx && (
                    <span className="compare-winner-badge">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>emoji_events</span>
                      Ganadora
                    </span>
                  )}
                  <button
                    className="compare-remove-btn"
                    onClick={() => eliminarMoto(moto.id)}
                    aria-label={`Quitar ${moto.nombre}`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                  </button>
                  <img
                    src={moto.imagen_url || 'https://placehold.co/300x160?text=Sin+imagen'}
                    alt={moto.nombre}
                    className="compare-bike-img"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x160?text=Sin+imagen'; }}
                  />
                </div>
              ))}

              {/* Slot vacío para añadir */}
              {slotsVacios > 0 && (
                <div className="compare-cell compare-add-slot" onClick={abrirModal}>
                  <div className="compare-add-circle">
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add</span>
                  </div>
                  <span className="compare-add-label">Añadir moto</span>
                </div>
              )}

              {/* ── Filas de especificaciones ── */}
              {FILAS.map(fila => (
                <>
                  {/* Etiqueta de la fila */}
                  <div key={`lbl-${fila.key}`} className="compare-cell compare-row-label">
                    {fila.label}
                  </div>

                  {/* Celda de cada moto */}
                  {motas.map((moto, i) => {
                    const highlight   = getHighlight(fila, moto, motas);
                    const mayorMenor  = getMayorMenor(fila, moto, motas);

                    return (
                      <div
                        key={`${fila.key}-${moto.id}`}
                        className={`compare-cell compare-value-cell ${highlight} ${i === winnerIdx ? 'compare-winner-col' : ''}`}
                      >
                        <span className="compare-value">{fmtValor(fila, moto)}</span>
                        {mayorMenor === 'mayor' && (
                          <span className="compare-tag compare-tag-mayor">Mayor</span>
                        )}
                        {mayorMenor === 'menor' && (
                          <span className="compare-tag compare-tag-menor">Menor</span>
                        )}
                        {highlight === 'cell-best' && (
                          <span className="material-symbols-outlined compare-cell-icon">arrow_upward</span>
                        )}
                        {highlight === 'cell-worst' && (
                          <span className="material-symbols-outlined compare-cell-icon">arrow_downward</span>
                        )}
                        {highlight === 'cell-tie' && (
                          <span className="material-symbols-outlined compare-cell-icon">drag_handle</span>
                        )}
                      </div>
                    );
                  })}

                  {/* Celda vacía en la columna de slot */}
                  {slotsVacios > 0 && (
                    <div key={`empty-${fila.key}`} className="compare-cell compare-empty-cell" />
                  )}
                </>
              ))}

              {/* ── Fila de botones "Ver detalle" ── */}
              <div className="compare-cell compare-label-header" />
              {motas.map((moto, i) => (
                <div
                  key={`cta-${moto.id}`}
                  className={`compare-cell compare-cta-cell ${i === winnerIdx ? 'compare-winner-col compare-winner-col--bottom' : ''}`}
                >
                  <button
                    className="compare-detail-btn"
                    onClick={() => navigate(`/motos/${moto.id}`)}
                  >
                    Ver detalle
                  </button>
                </div>
              ))}
              {slotsVacios > 0 && (
                <div className="compare-cell compare-empty-cell" />
              )}

            </div>
          </div>
        )}
      </main>

      {/* ── Modal para añadir moto ── */}
      {showModal && (
        <div className="compare-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="compare-modal" onClick={e => e.stopPropagation()}>
            <div className="compare-modal-header">
              <h2 className="compare-modal-title">Seleccionar moto</h2>
              <button className="compare-modal-close" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <input
              type="search"
              className="compare-modal-search"
              placeholder="Buscar por marca o modelo..."
              value={modalSearch}
              onChange={e => setModalSearch(e.target.value)}
              autoFocus
            />
            {loadingModal && <p className="compare-status">Cargando catálogo...</p>}
            <ul className="compare-modal-list">
              {motasFiltradas.map(moto => (
                <li
                  key={moto.id}
                  className="compare-modal-item"
                  onClick={() => agregarMoto(moto.id)}
                >
                  <img
                    src={moto.imagen_url || 'https://placehold.co/80x50?text=—'}
                    alt={moto.nombre}
                    className="compare-modal-thumb"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x50?text=—'; }}
                  />
                  <div>
                    <div className="compare-modal-item-name">{moto.nombre}</div>
                    <div className="compare-modal-item-sub">{moto.marca} · {moto.anio || '—'}</div>
                  </div>
                  <span className="material-symbols-outlined compare-modal-add-icon">add_circle</span>
                </li>
              ))}
              {!loadingModal && motasFiltradas.length === 0 && (
                <p className="compare-status">No se encontraron motos.</p>
              )}
            </ul>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ComparePage;
