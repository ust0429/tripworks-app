import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Initialize Firebase
import './config/firebaseConfig';

// Initialize Development Tools (only in development environment)
import { initDevTools } from './utils/developmentUtils';
initDevTools();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);