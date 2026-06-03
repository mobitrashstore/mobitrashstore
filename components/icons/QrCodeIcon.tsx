import React from 'react';

export const QrCodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A.75.75 0 014.5 3.75h4.5a.75.75 0 010 1.5H5.25A.75.75 0 004.5 6v3.75a.75.75 0 01-1.5 0V4.5zM3.75 19.5V15a.75.75 0 011.5 0v3.75c0 .414.336.75.75.75h3.75a.75.75 0 010 1.5H4.5A.75.75 0 013.75 19.5zM19.5 4.5V9a.75.75 0 01-1.5 0V5.25A.75.75 0 0017.25 4.5h-3.75a.75.75 0 010-1.5H19.5A.75.75 0 0119.5 4.5zM19.5 19.5a.75.75 0 01-.75.75h-4.5a.75.75 0 010-1.5h3.75a.75.75 0 00.75-.75V15a.75.75 0 011.5 0v4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12h.008v.008H12V12zm-3.75 0h.008v.008H8.25V12zm0 3.75h.008v.008H8.25v-3.75zm3.75 0h.008v.008H12v-3.75zm0-3.75h.008v.008H12V8.25zm3.75 0h.008v.008h-.008V8.25zm0 3.75h.008v.008h-.008v-3.75z" />
  </svg>
);
