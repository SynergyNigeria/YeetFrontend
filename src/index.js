import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/styles/index.css';
import './i18n'; // Initialize i18n
import { registerServiceWorker } from './services/pushNotifications';

// Capture the PWA install prompt BEFORE React mounts (event fires early)
window.__pwaInstallEvent = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__pwaInstallEvent = e;
  // Notify any listeners that have already mounted
  window.dispatchEvent(new Event('pwaInstallReady'));
});

window.addEventListener('appinstalled', () => {
  window.__pwaInstallEvent = null;
  window.dispatchEvent(new Event('pwaAppInstalled'));
});

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
