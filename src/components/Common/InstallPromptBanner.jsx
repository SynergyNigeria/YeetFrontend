import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X, Share } from 'react-feather';
import useInstallPrompt from '../../hooks/useInstallPrompt';

const InstallPromptBanner = () => {
  const { t } = useTranslation();
  const { isInstallable, isIOSDevice, deferredPrompt, triggerInstall, dismissPrompt } = useInstallPrompt();

  if (!isInstallable) return null;

  return (
    <div className="mx-4 mb-4 sm:mx-6 lg:mx-8">
      <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3">
        {/* App icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <img
            src="/icons/android-chrome-192x192.png"
            alt="Yeet Bank"
            className="w-7 h-7 rounded-md"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-tight">
            {t('Install Yeet Bank')}
          </p>
          <p className="text-white/70 text-xs mt-0.5 leading-tight">
            {isIOSDevice
              ? t('Tap the share icon then "Add to Home Screen"')
              : t('Add to your home screen for quick access')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* On iOS show a non-clickable hint; on Android/desktop trigger install */}
          {!isIOSDevice && deferredPrompt && (
            <button
              onClick={triggerInstall}
              className="flex items-center gap-1.5 bg-white text-[#2c3968] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/90 active:scale-95 transition-all"
            >
              <Download size={13} />
              {t('Install')}
            </button>
          )}
          {isIOSDevice && (
            <div className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-2 py-1.5 rounded-lg">
              <Share size={13} />
            </div>
          )}
          <button
            onClick={dismissPrompt}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPromptBanner;

