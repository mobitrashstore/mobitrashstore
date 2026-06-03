
import React from 'react';

export const FaceIdIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="1.5"
    {...props}
  >
    <path d="M7 3H5C3.89543 3 3 3.89543 3 5V7" strokeLinecap="round"/>
    <path d="M17 3H19C20.1046 3 21 3.89543 21 5V7" strokeLinecap="round"/>
    <path d="M21 17V19C21 20.1046 20.1046 21 19 21H17" strokeLinecap="round"/>
    <path d="M3 17V19C3 20.1046 3.89543 21 5 21H7" strokeLinecap="round"/>
    <path d="M8 11.5V11H8.01" strokeLinecap="round" strokeWidth="2.5"/>
    <path d="M16 11.5V11H16.01" strokeLinecap="round" strokeWidth="2.5"/>
    <path d="M9 16C9.5 17 10.5 17.5 12 17.5C13.5 17.5 14.5 17 15 16" strokeLinecap="round"/>
    <path d="M12 9V14H10.5" strokeLinecap="round"/>
  </svg>
);
