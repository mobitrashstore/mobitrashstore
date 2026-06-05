
import React from 'react';

const AuthOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-gradient-to-br from-[#ff5722] via-[#0f172a] to-[#0a0f1e] animate-fade-in backdrop-blur-lg">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative flex flex-col items-center">
        {/* RUNNING MAN KINETIC SVG */}
        <div className="w-48 h-48 mb-8 relative">
             <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full text-white fill-none stroke-white animate-run-shake"
                strokeWidth="4"
                strokeLinecap="round"
             >
                {/* Head */}
                <circle cx="65" cy="20" r="8" fill="currentColor" stroke="none" />
                
                {/* Torso/Body */}
                <path d="M60 28 L50 50 L45 45" />
                
                {/* Dynamic Limbs */}
                <g className="animate-limbs">
                    {/* Back Arm */}
                    <path d="M60 28 L40 35 L30 25" className="animate-back-arm" />
                    {/* Front Arm */}
                    <path d="M60 28 L75 40 L85 30" className="animate-front-arm" />
                    {/* Back Leg */}
                    <path d="M50 50 L30 65 L45 85" className="animate-back-leg" />
                    {/* Front Leg */}
                    <path d="M50 50 L65 70 L55 90" className="animate-front-leg" />
                </g>
             </svg>
             
             {/* Dynamic Wind/Speed Lines */}
             <div className="absolute top-1/2 -left-16 w-12 h-1.5 bg-white/40 rounded-full animate-wind"></div>
             <div className="absolute top-1/3 -left-24 w-16 h-1 bg-white/30 rounded-full animate-wind" style={{ animationDelay: '0.2s' }}></div>
             <div className="absolute top-2/3 -left-20 w-14 h-1 bg-white/20 rounded-full animate-wind" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* UI TEXT */}
        <div className="text-center relative z-10">
            <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase animate-pulse">
                Signing In...
            </h2>
            <div className="mt-4 flex flex-col items-center">
                <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-3">
                    Mobi Store Security Check
                </p>
                {/* Progress Indicator */}
                <div className="flex gap-2.5">
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes run-shake {
            0%, 100% { transform: translateY(0) rotate(-2deg); }
            50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes front-arm {
            0%, 100% { transform: rotate(-25deg); transform-origin: 60px 28px; }
            50% { transform: rotate(25deg); transform-origin: 60px 28px; }
        }
        @keyframes back-arm {
            0%, 100% { transform: rotate(25deg); transform-origin: 60px 28px; }
            50% { transform: rotate(-25deg); transform-origin: 60px 28px; }
        }
        @keyframes front-leg {
            0%, 100% { transform: rotate(-35deg); transform-origin: 50px 50px; }
            50% { transform: rotate(35deg); transform-origin: 50px 50px; }
        }
        @keyframes back-leg {
            0%, 100% { transform: rotate(35deg); transform-origin: 50px 50px; }
            50% { transform: rotate(-35deg); transform-origin: 50px 50px; }
        }
        @keyframes wind {
            0% { transform: translateX(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateX(300px); opacity: 0; }
        }
        .animate-run-shake { animation: run-shake 0.35s infinite ease-in-out; }
        .animate-front-arm { animation: front-arm 0.35s infinite ease-in-out; }
        .animate-back-arm { animation: back-arm 0.35s infinite ease-in-out; }
        .animate-front-leg { animation: front-leg 0.35s infinite ease-in-out; }
        .animate-back-leg { animation: back-leg 0.35s infinite ease-in-out; }
        .animate-wind { animation: wind 0.5s infinite linear; }
      `}</style>
    </div>
  );
};

export default AuthOverlay;
