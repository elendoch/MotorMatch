// pages/HomePage.jsx
// Página principal de MotorMatch (protegida: requiere sesión).
// Muestra el hero, buscador, botones de acción y el catálogo de motos
// cargado desde la base de datos a través del backend.

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BikeCard from '../components/BikeCard';
import api from '../services/api';

function HomePage() {
  const [motos, setMotos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  // Carga las motos desde el backend al montar el componente
  useEffect(() => {
    async function cargarMotos() {
      try {
        const res = await api.get('/bikes');
        setMotos(res.data);
      } catch (err) {
        setError('No se pudo cargar el catálogo. Intenta de nuevo más tarde.');
      } finally {
        setCargando(false);
      }
    }
    cargarMotos();
  }, []);

  // Filtra las motos según el texto de búsqueda
  const motosFiltradas = motos.filter(m =>
    `${m.name} ${m.brand} ${m.model}`.toLowerCase().includes(busqueda.toLowerCase())
  );

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

            <search className="hero-search">
              <label htmlFor="buscador" className="sr-only">Buscar motos</label>
              <input
                id="buscador"
                type="search"
                placeholder="¿Qué moto estás buscando?"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              <button type="button" aria-label="Buscar">Buscar</button>
              <button type="button" className="hero-search-filters" aria-label="Filtros">
                ⚙ Filtros
              </button>
            </search>
          </div>
        </section>

        {/* ── CTAs ── */}
        <section className="ctas" aria-label="Acciones principales">
          <button className="cta-btn cta-primary" type="button">
            Comenzar Cuestionario
          </button>
          <button className="cta-btn cta-accent" type="button">
            Comparar Motos
          </button>
        </section>

        {/* ── Catálogo ── */}
        <section className="catalog" aria-label="Catálogo de motos">
          <header className="catalog-header">
            <h2>Nuestro Garaje</h2>
            <p>Explora todas las motos disponibles</p>
          </header>

          {cargando && (
            <p className="catalog-status" role="status">Cargando motos...</p>
          )}

          {error && (
            <p className="catalog-status catalog-error" role="alert">{error}</p>
          )}

          {!cargando && !error && motosFiltradas.length === 0 && (
            <p className="catalog-status">No se encontraron motos con ese criterio.</p>
          )}

          {!cargando && !error && motosFiltradas.length > 0 && (
            <ul className="bike-grid" aria-label="Lista de motos">
              {motosFiltradas.map(moto => (
                <li key={moto.id}>
                  <BikeCard moto={moto} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default HomePage;
