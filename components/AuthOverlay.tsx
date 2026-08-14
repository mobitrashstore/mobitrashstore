import React, { useState, useEffect } from 'react';

const AuthOverlay: React.FC = () => {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        // Natural speed progression
        const step = prev < 50 ? Math.floor(Math.random() * 8) + 4 : Math.floor(Math.random() * 5) + 2;
        return Math.min(prev + step, 98);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Dynamic Status Message based on current progress percentage
  const getStatusText = (pct: number) => {
    if (pct < 28) return 'Authenticating Credentials...';
    if (pct < 58) return 'Verifying Security Tokens...';
    if (pct < 85) return 'Loading Storefront & Profile...';
    return 'Welcome back! Finalizing Session...';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#059669] text-white animate-fade-in select-none px-6">
      <div className="flex flex-col items-center max-w-sm w-full">
        
        {/* Running Man Animation Stage */}
        <div className="relative w-full mb-3 h-14">
          {/* Running Character - Positions dynamically along the progress bar */}
          <div
            className="absolute -top-1 transform -translate-x-1/2 transition-all duration-150 ease-out flex flex-col items-center"
            style={{ left: `${Math.max(6, Math.min(progress, 94))}%` }}
          >
            {/* Running Stickman/Runner SVG with animated limbs */}
            <div className="runner-figure">
              <svg
                className="w-10 h-10 text-white drop-shadow-md"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Head */}
                <circle cx="12" cy="4" r="2.5" fill="currentColor" />
                {/* Torso */}
                <path d="M12 7v6" />
                {/* Arms */}
                <path d="M9 9.5l3-1.5 3 2.5" className="runner-arm-front" />
                <path d="M15 9.5l-3-1.5-3 2" className="runner-arm-back" />
                {/* Legs with running stride */}
                <path d="M12 13l-3 4-2 3.5" className="runner-leg-front" />
                <path d="M12 13l3 3.5 3 4" className="runner-leg-back" />
              </svg>
            </div>
            {/* Speed dust particles */}
            <div className="flex gap-1 -mt-1 opacity-70">
              <span className="w-1 h-1 bg-white/70 rounded-full animate-ping" style={{ animationDuration: '0.4s' }}></span>
              <span className="w-1 h-1 bg-white/50 rounded-full animate-ping" style={{ animationDuration: '0.6s' }}></span>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar Container */}
        <div className="w-full bg-black/20 rounded-full h-3.5 p-0.5 border border-white/20 shadow-inner backdrop-blur-sm relative overflow-hidden mb-5">
          {/* Filled Progress Bar */}
          <div
            className="h-full bg-gradient-to-r from-emerald-200 via-white to-emerald-100 rounded-full transition-all duration-150 ease-out relative shadow-sm"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer Light Reflection */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Percentage Counter */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm font-mono">
            {progress}
          </span>
          <span className="text-lg font-bold text-emerald-200">%</span>
        </div>

        {/* Dynamic Status Text */}
        <p className="text-sm font-bold text-white tracking-wide text-center min-h-[22px] transition-all duration-200 drop-shadow-sm">
          {getStatusText(progress)}
        </p>

        <p className="text-[10px] font-bold text-emerald-200/80 tracking-widest uppercase mt-3">
          Mobi Store Secure Session
        </p>
      </div>

      {/* Running Animation Keyframes */}
      <style>{`
        .runner-figure {
          animation: runner-bob 0.3s infinite alternate ease-in-out;
        }
        @keyframes runner-bob {
          0% { transform: translateY(0px) rotate(-4deg); }
          100% { transform: translateY(-5px) rotate(4deg); }
        }
        .runner-leg-front {
          animation: leg-stride-1 0.3s infinite alternate ease-in-out;
          transform-origin: 12px 13px;
        }
        .runner-leg-back {
          animation: leg-stride-2 0.3s infinite alternate ease-in-out;
          transform-origin: 12px 13px;
        }
        @keyframes leg-stride-1 {
          0% { transform: rotate(-25deg); }
          100% { transform: rotate(35deg); }
        }
        @keyframes leg-stride-2 {
          0% { transform: rotate(35deg); }
          100% { transform: rotate(-25deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default AuthOverlay;

