
import React, { useState } from 'react';
// import { EnvelopeIcon } from '@heroicons/react/24/outline'; // Removed to avoid dependency issue
import { BoltIcon } from './icons/BoltIcon';

// Simple Envelope Icon inline if not available
const MailIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
);

const Newsletter: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'submitting'>('idle');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('submitting');

        // Mock API call
        setTimeout(() => {
            setStatus('success');
            setEmail('');
            setTimeout(() => setStatus('idle'), 3000);
        }, 1500);
    };

    return (
        <section className="py-8 md:py-12 px-4 md:px-0 mb-8">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 px-6 py-10 md:p-16 text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 mb-6 shadow-inner border border-slate-700">
                        <MailIcon className="w-6 h-6 text-blue-400" />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">
                        Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-sky-400">Eco-Movement.</span>
                    </h2>

                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Get exclusive offers, repair tips, and green-tech news delivered to your inbox.
                        No spam, just value.
                    </p>

                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex-1 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={status === 'submitting' || status === 'success'}
                            className={`px-8 py-3.5 rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 focus:ring-4 focus:ring-blue-500/30 transition-all ${status === 'success' ? 'bg-blue-700 cursor-default' : ''
                                }`}
                        >
                            {status === 'submitting' ? 'Joining...' : status === 'success' ? 'Welcome!' : 'Subscribe'}
                        </button>
                    </form>

                    <p className="mt-4 text-xs text-slate-500 font-medium">
                        Join 5,000+ subscribers. Unsubscribe anytime.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
