import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'material-symbols/outlined.css';
import './styles/global.css';
import './styles/global-additions.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);