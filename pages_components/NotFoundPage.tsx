

import React from 'react';
import { ArrowPathIcon } from '../components/icons/ArrowPathIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import SEO from '../components/SEO';

export interface NotFoundPageProps {
    navigate: (path: string) => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate }) => {
    const handleGoHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate('/');
    };

    return (
        <div className="text-center py-20 min-h-[60vh] flex flex-col items-center justify-center animate-fade-in px-4">
            <SEO 
                title="Page Not Found | Mobi Store" 
                description="The page you are looking for doesn't exist or has been moved."
            />
            {/* FORCE NO-INDEX FOR GOOGLE (Prevents Soft 404 indexing errors) */}
            <meta name="robots" content="noindex, follow" />
            
            <div className="relative">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-100 mb-6">
                     <TrashIcon className="w-12 h-12 text-emerald-500" />
                </div>
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                    <span className="text-xl">🤔</span>
                </div>
            </div>
            
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">404</h1>
            <h2 className="text-xl font-bold text-gray-800">Page Not Found</h2>
            
            <p className="text-gray-500 mt-3 max-w-xs mx-auto leading-relaxed"> {/* Re-introduced max-w-xs */}
                Looks like this page has been recycled or doesn't exist anymore.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <a 
                    href="/" 
                    onClick={handleGoHome} 
                    className="inline-flex items-center justify-center bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                >
                    Back to Home
                </a>
                <button 
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center justify-center gap-2 bg-white text-gray-600 font-bold py-3 px-8 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
                >
                    <ArrowPathIcon className="w-4 h-4" /> Try Reloading
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;
