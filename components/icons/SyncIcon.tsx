import React from 'react';

export const SyncIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M16 12a4 4 0 0 1-4 4" />
        <path d="M8 12a4 4 0 0 1 4-4" />
        <polyline points="13 16 16 12 13 8" />
        <polyline points="11 8 8 12 11 16" />
    </svg>
);
