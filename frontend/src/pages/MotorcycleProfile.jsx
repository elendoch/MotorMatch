import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/MotorcycleProfile.css';

const MotorcycleProfile = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    presupuesto: '',
    incluye_soat: false,
    incluye_traspaso: false,
    tipo_uso: '',
    frecuencia_uso: '',
    lleva_pasajero: null,
    estatura: '173',
    peso_moto: '120',
    transmision: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const budgetPresets = [5000000, 10000000, 15000000, 20000000, 25000000, 30000000];
  const formatCurrency = (val) => new Intl.NumberFormat('es-CO').format(val);

  const handleBudgetPreset = (val) => {
    setFormData(prev => ({ ...prev, presupuesto: val.toString() }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!formData.presupuesto) return setError('Por favor, ingresa tu presupuesto.');
    if (!formData.tipo_uso) return setError('Por favor, selecciona el tipo de uso.');
    if (!formData.frecuencia_uso) return setError('Por favor, selecciona la frecuencia de uso.');
    if (formData.lleva_pasajero === null) return setError('Por favor, indica si llevarás pasajero.');
    if (!formData.transmision) return setError('Por favor, selecciona tu preferencia de transmisión.');

    setIsSubmitting(true);

    try {
      // Get the token and decode to get user_id (if not using middleware)
      const token = localStorage.getItem('token');
      let userId = null;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.id;
        } catch(e) {
           console.error("Error decoding token", e);
        }
      }

      if(!userId) {
        console.warn("No hay usuario autenticado. Usando usuario de prueba ID: 1");
        userId = 1; // Fallback temporal para pruebas
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const payload = {
        ...formData,
        usuario_id: userId,
        presupuesto: parseInt(formData.presupuesto.replace(/\D/g, '') || 0)
      };

      await axios.post(`${API_URL}/profile`, payload);
      setSuccess('¡Tu perfil ha sido creado exitosamente!');
      
      setTimeout(() => {
        navigate('/inicio');
      }, 2500);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Ocurrió un error al guardar tu perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header text-center">
        <h1>MotorMatch</h1>
      </div>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="submit-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        
        {/* Presupuesto */}
        <div className="profile-card">
          <h2 className="profile-question">¿Cuál es tu presupuesto?</h2>
          <span className="profile-subtext">Ingresa el presupuesto que invertirás en tu moto, el presupuesto mínimo es de $3.500.000</span>
          
          <div className="budget-input-wrapper">
            <span className="currency-symbol">$</span>
            <input 
              type="number" 
              className="budget-input"
              placeholder="Ej: 10000000"
              name="presupuesto"
              value={formData.presupuesto}
              onChange={handleInputChange}
            />
          </div>

          <span className="profile-subtext">Valores frecuentes</span>
          <div className="budget-presets">
            {budgetPresets.map(val => (
              <button 
                type="button" 
                key={val}
                className={`preset-btn ${parseInt(formData.presupuesto) === val ? 'active' : ''}`}
                onClick={() => handleBudgetPreset(val)}
              >
                ${val / 1000000}M
              </button>
            ))}
          </div>

          <span className="profile-subtext">¿El presupuesto incluye?</span>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                name="incluye_soat"
                checked={formData.incluye_soat}
                onChange={handleInputChange}
              /> SOAT (seguro obligatorio)
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                name="incluye_traspaso"
                checked={formData.incluye_traspaso}
                onChange={handleInputChange}
              /> Traspaso o Matrícula
            </label>
          </div>
        </div>

        {/* Tipo de uso */}
        <div className="profile-card">
          <h2 className="profile-question">¿Qué tipo de uso le darás a la moto?</h2>
          <div className="icon-options">
            <button type="button" className={`icon-btn ${formData.tipo_uso === 'Ciudad' ? 'active' : ''}`} onClick={() => handleInputChange({ target: { name: 'tipo_uso', value: 'Ciudad' } })}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13"/><path d="M9 22V12h6v10"/><path d="M14 9v.01"/><path d="M10 9v.01"/><path d="M14 13v.01"/><path d="M10 13v.01"/><path d="M14 17v.01"/><path d="M10 17v.01"/></svg>
              <span>Ciudad</span>
            </button>
            <button type="button" className={`icon-btn ${formData.tipo_uso === 'Carretera' ? 'active' : ''}`} onClick={() => handleInputChange({ target: { name: 'tipo_uso', value: 'Carretera' } })}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 11-4-4"/><path d="m6 11 4-4"/><path d="M2 22 12 2l10 20"/></svg>
              <span>Carretera</span>
            </button>
            <button type="button" className={`icon-btn ${formData.tipo_uso === 'Trabajo' ? 'active' : ''}`} onClick={() => handleInputChange({ target: { name: 'tipo_uso', value: 'Trabajo' } })}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <span>Trabajo</span>
            </button>
            <button type="button" className={`icon-btn ${formData.tipo_uso === 'Off-road' ? 'active' : ''}`} onClick={() => handleInputChange({ target: { name: 'tipo_uso', value: 'Off-road' } })}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
              <span>Off-road</span>
            </button>
            <button type="button" className={`icon-btn ${formData.tipo_uso === 'Deporte' ? 'active' : ''}`} onClick={() => handleInputChange({ target: { name: 'tipo_uso', value: 'Deporte' } })}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Deporte</span>
            </button>
          </div>
        </div>

        {/* Frecuencia de uso */}
        <div className="profile-card">
          <h2 className="profile-question">¿Con qué frecuencia utilizarás la moto?</h2>
          <div className="radio-group">
            {['Todos los días', 'Varias veces a la semana', 'Solo fines de semana', 'Ocasionalmente'].map(option => (
              <label className="radio-label" key={option}>
                <input 
                  type="radio" 
                  name="frecuencia_uso" 
                  value={option}
                  checked={formData.frecuencia_uso === option}
                  onChange={handleInputChange}
                /> {option}
              </label>
            ))}
          </div>
        </div>

        {/* Pasajero */}
        <div className="profile-card">
          <h2 className="profile-question">¿Llevarás pasajero?</h2>
          <div className="wide-options">
            <button type="button" className={`wide-btn ${formData.lleva_pasajero === true ? 'active' : ''}`} onClick={() => handleInputChange({ target: { name: 'lleva_pasajero', value: true } })}>Sí</button>
            <button type="button" className={`wide-btn ${formData.lleva_pasajero === false ? 'active' : ''}`} onClick={() => handleInputChange({ target: { name: 'lleva_pasajero', value: false } })}>No</button>
          </div>
        </div>

        {/* Estatura */}
        <div className="profile-card">
          <h2 className="profile-question">¿Cuál es tu estatura?</h2>
          <div className="slider-container">
            <div className="slider-value-display">{formData.estatura}cm</div>
            <input 
              type="range" 
              name="estatura"
              min="140" 
              max="210" 
              className="custom-range"
              value={formData.estatura}
              onChange={handleInputChange}
            />
            <div className="slider-labels">
              <div className={`slider-label ${parseInt(formData.estatura) < 160 ? 'active' : ''}`}>
                <strong>Baja</strong>
                &lt; 160 cm
              </div>
              <div className={`slider-label ${parseInt(formData.estatura) >= 160 && parseInt(formData.estatura) <= 180 ? 'active' : ''}`}>
                <strong>Media</strong>
                160cm - 180cm
              </div>
              <div className={`slider-label ${parseInt(formData.estatura) > 180 ? 'active' : ''}`}>
                <strong>Alta</strong>
                &gt; 180 cm
              </div>
            </div>
          </div>
        </div>

        {/* Peso motos */}
        <div className="profile-card">
          <h2 className="profile-question">¿Qué tan pesadas te gustan las motos?</h2>
          <div className="slider-container">
            <div className="slider-value-display">{formData.peso_moto} kg</div>
            <input 
              type="range" 
              name="peso_moto"
              min="80" 
              max="350" 
              className="custom-range"
              value={formData.peso_moto}
              onChange={handleInputChange}
            />
            <div className="slider-labels">
              <div className={`slider-label ${parseInt(formData.peso_moto) < 120 ? 'active' : ''}`}>
                <strong>Liviana</strong>
                &lt; 120 kg
              </div>
              <div className={`slider-label ${parseInt(formData.peso_moto) >= 120 && parseInt(formData.peso_moto) <= 200 ? 'active' : ''}`}>
                <strong>Mediana</strong>
                120 kg - 200 kg
              </div>
              <div className={`slider-label ${parseInt(formData.peso_moto) > 200 ? 'active' : ''}`}>
                <strong>Pesada</strong>
                &gt; 200 kg
              </div>
            </div>
          </div>
        </div>

        {/* Transmisión */}
        <div className="profile-card">
          <h2 className="profile-question">¿Qué tipo de transmisión prefieres?</h2>
          <div className="wide-options">
            <button type="button" className={`wide-btn ${formData.transmision === 'Automática' ? 'active' : ''}`} onClick={() => handleInputChange({ target: { name: 'transmision', value: 'Automática' } })}>Automática</button>
            <button type="button" className={`wide-btn ${formData.transmision === 'Semi-automática' ? 'active' : ''}`} onClick={() => handleInputChange({ target: { name: 'transmision', value: 'Semi-automática' } })}>Semi-automática</button>
            <button type="button" className={`wide-btn ${formData.transmision === 'Manual' ? 'active' : ''}`} onClick={() => handleInputChange({ target: { name: 'transmision', value: 'Manual' } })}>Manual</button>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/inicio')}>Volver a inicio</button>
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default MotorcycleProfile;
