import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import './styles/button-visibility.css';
import './styles/enhanced-animations.css';
import './styles/auth-modern.css';
import './styles/dashboard.css';
import './styles/forms.css';
import './styles/components.css';

// Load button verification utilities in development
if (process.env.NODE_ENV === 'development') {
  import('./utils/buttonVerification.js').catch(e => console.warn('Button verification not loaded'));
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
