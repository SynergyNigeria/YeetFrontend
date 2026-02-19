import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/styles/index.css';
import { registerServiceWorker } from './services/pushNotifications';

// Slow smooth scrolling
document.addEventListener('wheel', function(e) {
  if (e.deltaY !== 0) {
    e.preventDefault();
    const scrollAmount = e.deltaY > 0 ? 30 : -30;
    window.scrollBy({
      top: scrollAmount,
      behavior: 'smooth'
    });
  }
}, { passive: false });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA and push notifications
registerServiceWorker().catch(console.error);
