import React from 'react';

const Spinner: React.FC<{ size?: string }> = ({ size = 'w-8 h-8' }) => {
    return (
        <div className={`animate-spin rounded-full border-4 border-slate-400 border-t-amber-500 ${size}`} role="status">
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default Spinner;
