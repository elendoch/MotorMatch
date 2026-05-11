// pages/UserDashboard.jsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/UserDashboard.css';

const UserDashboard = () => {
  // Datos de prueba (esto se conectará al backend luego)
  const userData = {
    nombre: "Usuario",
    ciudad: "Ciudad",
    avatar: "https://i.pravatar.cc/150?u=motormatch",
    motoPersonal: {
      marca: "Yamaha",
      nombre: "MT-07",
      año: "2023",
      imagen: "https://dd5394a0.rocketcdn.me/wp-content/uploads/2022/10/2023-Yamaha-MT-07-Europa-3.jpg"
    },
    stats: {
      comparaciones: 3,
      favoritas: 10
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="dashboard-container">
        {/* COLUMNA IZQUIERDA */}
        <aside className="dashboard-sidebar">
          
          {/* Tarjeta de Perfil */}
          <section className="dashboard-card profile-card">
            <img src={userData.avatar} alt="Avatar" className="avatar-large" />
            <div className="profile-info">
              <h2>{userData.nombre}</h2>
              <p>{userData.ciudad}</p>
            </div>
            <button className="btn-outline">Editar usuario</button>
          </section>

          {/* Tarjeta de Moto Personal */}
          <section className="dashboard-card personal-bike-card">
            <h3>Moto personal</h3>
            <img src={userData.motoPersonal.imagen} alt="Moto" className="bike-display-img" />
            <div className="bike-info-grid">
              <div>
                <span className="info-label">Marca</span>
                <span className="info-value">{userData.motoPersonal.marca}</span>
                <h4 className="info-value">{userData.motoPersonal.nombre}</h4>
                <span className="info-label">Año</span>
                <span className="info-value">{userData.motoPersonal.año}</span>
              </div>
            </div>
            <div className="bike-actions">
              <button className="btn-update">Actualizar</button>
              <button className="btn-circle">→</button>
            </div>
          </section>

          {/* Tarjeta de Estadísticas */}
          <section className="dashboard-card stats-card">
            <h3>Estadísticas</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{userData.stats.comparaciones}</span>
                <span className="stat-label">comparaciones</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{userData.stats.favoritas}</span>
                <span className="stat-label">favoritas</span>
              </div>
            </div>
          </section>
        </aside>

        {/* COLUMNA DERECHA / PRINCIPAL */}
        <div className="dashboard-main">
          
          {/* Preferencias */}
          <section className="dashboard-card section-card">
            <h3>Preferencias</h3>
            <div className="preferences-grid">
              <div className="pref-item">
                <span className="pref-icon">$</span>
                <span className="pref-label">Presupuesto</span>
              </div>
              <div className="pref-item">
                <span className="pref-icon">🏠</span>
                <span className="pref-label">Uso</span>
              </div>
              <div className="pref-item">
                <span className="pref-icon">⚡</span>
                <span className="pref-label">Peso ideal</span>
              </div>
              <div className="pref-item">
                <span className="pref-icon">⚙️</span>
                <span className="pref-label">Transmisión</span>
              </div>
            </div>
          </section>

          {/* Motos Favoritas */}
          <section className="dashboard-card section-card">
            <div className="favorites-header">
              <h3>Motos favoritas</h3>
              <a href="/garaje" className="btn-garage">Ir al garaje</a>
            </div>
            <div className="favorites-list">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bike-mini-card">
                  <img src="https://motos-b6c.pages.dev/img/yamaha-mt07.png" alt="Moto" className="mini-bike-img" />
                  <div className="mini-bike-info">
                    <span className="mini-label">Marca</span>
                    <span className="mini-value">Yamaha</span>
                    <span className="mini-value">Nombre</span>
                    <span className="mini-label">Año</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Actividad Reciente */}
          <section className="dashboard-card section-card">
            <h3>Actividad reciente</h3>
            <div className="activity-box"></div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
