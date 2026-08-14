import React from 'react';

const AuthOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-[#059669] text-white animate-fade-in select-none">
      <div className="flex flex-col items-center px-6 py-8">
        {/* Clean Official Brand Logo / Icon */}
        <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-2xl bg-white/10 border border-white/20 shadow-2xl backdrop-blur-md">
          <svg className="w-10 h-10 text-white animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        {/* Clean Typography */}
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Signing In...
        </h2>
        <p className="text-xs font-medium text-emerald-100/90 tracking-wide uppercase">
          Mobi Store Secure Session
        </p>

        {/* Clean Subtle Dots */}
        <div className="mt-5 flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default AuthOverlay;
