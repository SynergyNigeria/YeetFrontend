import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Splash = () => {
  const { isLoading } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-[#2c3968] flex items-center justify-center overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Logo Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-24 h-24">
            <img src="/icons/yeet-icon.png" alt="Yeet Bank" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Brand Text */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-[#FAF9F6] mb-2 tracking-tight">
            Yeet Bank
          </h1>
          <p className="text-xl text-[#FAF9F6] opacity-75 font-light">
            Modern Banking Experience
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="flex justify-center gap-3 mt-12">
          <div className="w-3 h-3 rounded-full bg-[#FAF9F6] animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-[#FAF9F6] animate-pulse animation-delay-200"></div>
          <div className="w-3 h-3 rounded-full bg-[#FAF9F6] animate-pulse animation-delay-400"></div>
        </div>

        {/* Status Text */}
        <p className="text-[#FAF9F6] opacity-50 text-sm mt-8 font-light">
          {isLoading ? 'Verifying your credentials...' : 'Connecting...'}
        </p>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-32"></div>
    </div>
  );
};

export default Splash;
