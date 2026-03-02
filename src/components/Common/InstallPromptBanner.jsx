import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X, Share } from 'react-feather';
import useInstallPrompt from '../../hooks/useInstallPrompt';

// Step-by-step modal for iOS (Safari doesn't support beforeinstallprompt)
const IOSInstructionModal = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6"
    onClick={onClose}
  >
    <div
      className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Add to Home Screen</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
          <X size={20} />
        </button>
      </div>

      <p className="text-gray-500 text-sm mb-5">
        Install YEET Bank on your iPhone for quick access — no App Store needed.
      </p>

      <ol className="space-y-4">
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#2c3968] text-white text-sm font-bold flex items-center justify-center">1</span>
          <div>
            <p className="text-sm font-medium text-gray-800">Tap the Share button</p>
            <p className="text-xs text-gray-500 mt-0.5">Look for the
              <span className="inline-flex items-center mx-1 px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                <Share size={11} className="mr-1" />Share
              </span>
              icon at the bottom of Safari.
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#2c3968] text-white text-sm font-bold flex items-center justify-center">2</span>
          <div>
            <p className="text-sm font-medium text-gray-800">Scroll down and tap <em>"Add to Home Screen"</em></p>
            <p className="text-xs text-gray-500 mt-0.5">You may need to scroll down in the share sheet to find it.</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#2c3968] text-white text-sm font-bold flex items-center justify-center">3</span>
          <div>
            <p className="text-sm font-medium text-gray-800">Tap <em>"Add"</em></p>
            <p className="text-xs text-gray-500 mt-0.5">YEET Bank will appear on your home screen like any other app.</p>
          </div>
        </li>
      </ol>

      <button
        onClick={onClose}
        className="mt-6 w-full py-3 bg-[#2c3968] text-white font-semibold rounded-xl text-sm hover:opacity-90 transition"
      >
        Got it!
      </button>
    </div>
  </div>
);

const InstallPromptBanner = () => {
  const { t } = useTranslation();
  const { isInstallable, isIOSDevice, deferredPrompt, triggerInstall, dismissPrompt } = useInstallPrompt();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (!isInstallable) return null;

  return (
    <>
      {showIOSModal && <IOSInstructionModal onClose={() => setShowIOSModal(false)} />}

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
                ? t('Tap here for install instructions')
                : t('Add to your home screen for quick access')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Android / desktop: trigger native install prompt */}
            {!isIOSDevice && (deferredPrompt || window.__pwaInstallEvent) && (
              <button
                onClick={triggerInstall}
                className="flex items-center gap-1.5 bg-white text-[#2c3968] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/90 active:scale-95 transition-all"
              >
                <Download size={13} />
                {t('Install')}
              </button>
            )}
            {/* iOS: open step-by-step modal */}
            {isIOSDevice && (
              <button
                onClick={() => setShowIOSModal(true)}
                className="flex items-center gap-1.5 bg-white text-[#2c3968] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/90 active:scale-95 transition-all"
              >
                <Share size={13} />
                {t('How to install')}
              </button>
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
    </>
  );
};

export default InstallPromptBanner;

