import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TripworksApp from './AppWithNotifications';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <TripworksApp />
  </React.StrictMode>
);