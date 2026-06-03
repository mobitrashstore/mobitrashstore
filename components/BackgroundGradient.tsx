import React from 'react';

const BackgroundGradient: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1389 1479"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full object-cover"
      >
        {/* Increased opacity to 0.8 as requested for higher visibility */}
        <g opacity="0.8">
          <mask id="bg-mask" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="1389" height="1479">
            <path fill="#D9D9D9" d="M0 0h1389v1479H0z" />
          </mask>
          <g mask="url(#bg-mask)">
            <ellipse opacity=".5" cy="1007.5" rx="160" ry="160.5" fill="url(#grad-b)" />
            <circle opacity=".5" cx="857.242" cy="375.085" r="91.111" fill="url(#grad-c)" />
            <rect opacity=".5" x="-.664" y="273.555" width="386.866" height="386.866" rx="24" transform="rotate(-45 -.664 273.555)" fill="url(#grad-d)" />
            <rect opacity=".5" x="288.662" y="1179.43" width="718.993" height="424.487" rx="32" transform="rotate(-45 288.662 1179.43)" fill="url(#grad-e)" />
            <circle opacity=".5" cx="1389.13" cy="530.129" r="220.13" fill="url(#grad-f)" />
            <circle opacity=".5" cx="1205.72" cy="1387.95" r="91.111" fill="url(#grad-g)" />
          </g>
        </g>
        <defs>
          <linearGradient id="grad-b" x1="-61.873" y1="861.062" x2=".372" y2="1167.92" gradientUnits="userSpaceOnUse">
            <stop stopColor="#86B3FE" />
            <stop offset=".993" stopColor="#F5F5FA" />
          </linearGradient>
          <linearGradient id="grad-c" x1="766.131" y1="250.722" x2="857.242" y2="466.196" gradientUnits="userSpaceOnUse">
            <stop stopColor="#86B3FE" />
            <stop offset="1" stopColor="#F5F5FA" />
          </linearGradient>
          <linearGradient id="grad-d" x1="117.967" y1="290.503" x2="192.769" y2="660.421" gradientUnits="userSpaceOnUse">
            <stop stopColor="#86B3FE" />
            <stop offset=".993" stopColor="#F5F5FA" />
          </linearGradient>
          <linearGradient id="grad-e" x1="616.714" y1="1247.46" x2="920.97" y2="1639.19" gradientUnits="userSpaceOnUse">
            <stop offset=".091" stopColor="#F5F5FA" />
            <stop offset=".948" stopColor="#86B3FE" />
          </linearGradient>
          <linearGradient id="grad-f" x1="1456.96" y1="604.614" x2="1389.13" y2="750.259" gradientUnits="userSpaceOnUse">
            <stop stopColor="#86B3FE" />
            <stop offset=".993" stopColor="#F5F5FA" />
          </linearGradient>
          <linearGradient id="grad-g" x1="1242.3" y1="1427.85" x2="1140.55" y2="1333.41" gradientUnits="userSpaceOnUse">
            <stop stopColor="#86B3FE" />
            <stop offset="1" stopColor="#F5F5FA" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default BackgroundGradient;
