import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'yeet_pwa_install_dismissed';

// Detect iOS Safari (it doesn't support beforeinstallprompt but supports Add to Home Screen)
const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(() => window.__pwaInstallEvent || null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISSED_KEY) === 'true';

    if (isInStandaloneMode()) {
      setIsInstalled(true);
      return;
    }

    if (wasDismissed) return;

    // iOS: show manual instructions banner
    if (isIOS()) {
      setIsIOSDevice(true);
      setIsInstallable(true);
      return;
    }

    // Already captured before React mounted
    if (window.__pwaInstallEvent) {
      setDeferredPrompt(window.__pwaInstallEvent);
      setIsInstallable(true);
    }

    // Also listen in case it fires after mount
    const onReady = () => {
      if (window.__pwaInstallEvent) {
        setDeferredPrompt(window.__pwaInstallEvent);
        setIsInstallable(true);
      }
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      localStorage.removeItem(DISMISSED_KEY);
    };

    window.addEventListener('pwaInstallReady', onReady);
    window.addEventListener('pwaAppInstalled', onInstalled);

    return () => {
      window.removeEventListener('pwaInstallReady', onReady);
      window.removeEventListener('pwaAppInstalled', onInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
      window.__pwaInstallEvent = null;
    }
    setDeferredPrompt(null);
  };

  const dismissPrompt = () => {
    setIsInstallable(false);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  return { isInstallable, isInstalled, isIOSDevice, deferredPrompt, triggerInstall, dismissPrompt };
};

export default useInstallPrompt;
