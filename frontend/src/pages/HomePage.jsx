// pages/HomePage.jsx
// Cambios respecto a la versión anterior:
//   - Importa FilterModal y sus constantes
//   - Agrega estado de filtros (filtros) y visibilidad del modal (modalFiltros)
//   - Extrae marcas únicas del catálogo cargado
//   - Filtra motos por: nombre, precioMax, marcas, cilindrajeMax, transmisiones
//   - Muestra badge numérico en el botón "Filtros" cuando hay filtros activos
//   - Carga IDs de favoritos del usuario al iniciar y los pasa a cada MotoCard
//   - Botón CTA "Comparar motos" ahora redirige a /comparar

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MotoCard from '../components/MotoCard';
import FilterModal, {
  FILTROS_VACIOS,
  PRECIO_MAX,
  CC_MAX,
} from '../components/FilterModal';
import api from '../services/api';

function HomePage() {
  const navigate = useNavigate();

  /* ── Estado del catálogo ── */
  const [motos, setMotos]       = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);

  /* ── Búsqueda por texto ──
       busqueda → valor en vivo del input (no dispara filtro)
       termino  → valor confirmado al pulsar Buscar / Enter  */
  const [busqueda, setBusqueda] = useState('');
  const [termino, setTermino]   = useState('');

  /* ── Estado del modal de filtros ── */
  const [modalFiltros, setModalFiltros] = useState(false);

  /* filtros: objeto con los criterios activos.
     Se actualiza solo al cerrar el modal (botón X / clic backdrop / botón Aplicar). */
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);

  /* ── IDs de motos favoritas del usuario (Set para lookup O(1)) ──
     Se puebla al montar si el usuario tiene sesión activa.
     Si no hay sesión (401) queda vacío — los corazones aparecen
     sin marcar sin romper nada. */
  const [favoritosIds, setFavoritosIds] = useState(new Set());

  /* ── Carga inicial del catálogo ── */
  useEffect(() => {
    async function cargarMotos() {
      try {
        const res = await api.get('/bikes');
        setMotos(res.data);
      } catch {
        setError('No se pudo cargar el catálogo. Intenta de nuevo más tarde.');
      } finally {
        setCargando(false);
      }
    }
    cargarMotos();
  }, []);

  /* ── Carga inicial de favoritos (independiente del catálogo) ──
     Si el interceptor de api.js agrega el token automáticamente,
     esta petición funciona sin configuración extra.
     Un 401/403 simplemente no hace nada (usuario no autenticado). */
  useEffect(() => {
    async function cargarFavoritos() {
      try {
        const res = await api.get('/favorites');
        setFavoritosIds(new Set(res.data.favoriteIds));
      } catch {
        /* Sin sesión o error de red: los corazones se muestran vacíos */
      }
    }
    cargarFavoritos();
  }, []);

  /* ── Marcas únicas extraídas del catálogo ─────────────────────
     Se recalcula solo cuando cambia el array de motos. */
  const marcasDisponibles = useMemo(
    () => [...new Set(motos.map(m => m.marca).filter(Boolean))].sort(),
    [motos]
  );

  /* ── Número de grupos de filtros activos (para el badge) ── */
  const filtrosActivos = [
    filtros.precioMax      < PRECIO_MAX,
    filtros.marcas.length  > 0,
    filtros.cilindrajeMax  < CC_MAX,
    filtros.transmisiones.length > 0,
  ].filter(Boolean).length;

  /* ── Filtrado combinado: texto + filtros del modal ────────────
     Cada condición se salta si el filtro no está configurado,
     para no excluir motos que no tienen ese campo en la BD. */
  const terminoNorm = termino.toLowerCase();

  const motosFiltradas = useMemo(() => {
    return motos.filter(moto => {
      /* 1. Búsqueda por nombre */
      if (termino) {
        const nombre = (moto.nombre ?? '').toLowerCase();
        if (!nombre.includes(terminoNorm)) return false;
      }

      /* 2. Precio <= precioMax  (solo si el campo existe) */
      if (moto.precio != null && moto.precio > filtros.precioMax) return false;

      /* 3. Marca dentro de las seleccionadas (vacío = todas) */
      if (filtros.marcas.length > 0 && !filtros.marcas.includes(moto.marca)) return false;

      /* 4. Cilindraje <= cilindrajeMax  (solo si el campo existe) */
      if (moto.cilindraje != null && moto.cilindraje > filtros.cilindrajeMax) return false;

      /* 5. Transmisión dentro de las seleccionadas (vacío = todas)
            Comparación case-insensitive para mayor tolerancia */
      if (filtros.transmisiones.length > 0) {
        const transmMoto = (moto.transmision ?? '').toLowerCase();
        const coincide = filtros.transmisiones.some(t =>
          transmMoto.includes(t.toLowerCase())
        );
        if (!coincide) return false;
      }

      return true;
    });
  }, [motos, termino, terminoNorm, filtros]);

  /* ── Handlers de búsqueda por texto ── */
  const handleSearch = () => {
    const nuevo = busqueda.trim();
    if (nuevo === termino) return;
    setTermino(nuevo);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClear = () => {
    setBusqueda('');
    setTermino('');
  };

  /* ── Handlers del modal ── */
  const abrirModal = () => setModalFiltros(true);

  /* Se llama al cerrar el modal; recibe el objeto de filtros del borrador */
  const cerrarModal = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    setModalFiltros(false);
  };

  return (
    <>
      <Header />

      <main>
        {/* ── Hero ── */}
        <section className="hero" aria-label="Buscador de motos">
          <div className="hero-bg" aria-hidden="true" />
          <div className="hero-content">
            <h1>Encuentra tu moto ideal en Colombia</h1>
            <p>Descubre la libertad sobre dos ruedas con la mejor asesoría personalizada.</p>

            {/* ── Barra de búsqueda ── */}
            <search className="hero-search">
              <label htmlFor="buscador" className="sr-only">Buscar motos</label>

              {/* Wrapper input + botón X */}
              <div className="hero-search-input-wrapper">
                <input
                  id="buscador"
                  type="search"
                  placeholder="¿Qué moto estás buscando?"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  className={`hero-search-clear ${busqueda ? 'visible' : ''}`}
                  aria-label="Limpiar búsqueda"
                  onClick={handleClear}
                  tabIndex={busqueda ? 0 : -1}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Botón lupa */}
              <button
                type="button"
                className="hero-search-submit"
                aria-label="Buscar"
                onClick={handleSearch}
              >
                <span className="material-symbols-outlined tune-icon">search</span>
              </button>

              {/* Botón Filtros — abre el modal */}
              <button
                type="button"
                className={`hero-search-filters ${filtrosActivos > 0 ? 'has-filters' : ''}`}
                aria-label={`Filtros${filtrosActivos > 0 ? ` (${filtrosActivos} activos)` : ''}`}
                onClick={abrirModal}
              >
                Filtros
                <span className="material-symbols-outlined tune-icon">tune</span>
                {/* Badge con conteo de filtros activos */}
                {filtrosActivos > 0 && (
                  <span className="filters-badge" aria-hidden="true">
                    {filtrosActivos}
                  </span>
                )}
              </button>
            </search>
          </div>
        </section>

        {/* ── CTAs ── */}
        <section className="ctas" aria-label="Acciones principales">
          <button className="cta-btn cta-primary" type="button" onClick={() => navigate('/survey')}>
            <span className="material-symbols-outlined tune-icon">assignment</span>
            Cuestionario
          </button>
          <button className="cta-btn cta-accent" type="button" onClick={() => navigate('/comparar')}>
            <span className="material-symbols-outlined tune-icon">compare_arrows</span>
            Comparar motos
          </button>
        </section>

        {/* ── Catálogo ── */}
        <section className="catalog" aria-label="Catálogo de motos">
          <header className="catalog-header">
            <h2>Nuestro Garaje</h2>
            <p>
              {filtrosActivos > 0 || termino
                ? `${motosFiltradas.length} moto${motosFiltradas.length !== 1 ? 's' : ''} encontrada${motosFiltradas.length !== 1 ? 's' : ''}`
                : 'Explora todas las motos disponibles'}
            </p>
          </header>

          {cargando && (
            <p className="catalog-status" role="status">Cargando motos...</p>
          )}

          {error && (
            <p className="catalog-status catalog-error" role="alert">{error}</p>
          )}

          {!cargando && !error && motosFiltradas.length === 0 && (
            <p className="catalog-status">
              No se encontraron motos con ese criterio.{' '}
              {(filtrosActivos > 0 || termino) && (
                <button
                  type="button"
                  className="link-orange"
                  onClick={() => { setFiltros(FILTROS_VACIOS); setTermino(''); setBusqueda(''); }}
                >
                  Limpiar filtros
                </button>
              )}
            </p>
          )}

          {!cargando && !error && motosFiltradas.length > 0 && (
            <ul className="bike-grid" aria-label="Lista de motos">
              {motosFiltradas.map(moto => (
                <li key={moto.id}>
                  {/* esFavorito se calcula del Set de IDs — O(1) lookup */}
                  <MotoCard
                    {...moto}
                    esFavorito={favoritosIds.has(moto.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <Footer />

      {/* ── Modal de filtros ── */}
      <FilterModal
        isOpen={modalFiltros}
        onClose={cerrarModal}
        marcasDisponibles={marcasDisponibles}
        filtrosIniciales={filtros}
      />
    </>
  );
}

export default HomePage;
