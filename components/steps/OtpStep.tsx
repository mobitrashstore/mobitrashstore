import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { functions } from '../../services/firebase';
import { sendEmail, getOtpEmailTemplate } from '../../services/email';
// import emailjs from '@emailjs/browser';


interface OtpStepProps {
    onBack: () => void;
    onNext: (details: any) => void;
}

const OtpStep: React.FC<OtpStepProps> = ({ onBack, onNext }) => {
    const [view, setView] = useState<'details' | 'otp'>('details');
    const [details, setDetails] = useState({
        fullName: '',
        address: '',
        phone: '',
        email: ''
    });
    const [otpInput, setOtpInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSendRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
        // Store OTP temporarily in session storage for verification
        sessionStorage.setItem('otp', generatedOtp);
        sessionStorage.setItem('otp_email', details.email);


        try {
            const emailBody = getOtpEmailTemplate(details.fullName, generatedOtp);
            await sendEmail({
                to: details.email,
                subject: 'Mobi Store: Your Verification Code',
                body: emailBody
            });
            setView('otp');
            setResendTimer(15);
        } catch (err) {
            console.error('Failed to send OTP:', err);
            setError('Failed to send OTP. Please check your network or try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        const storedOtp = sessionStorage.getItem('otp');
        const storedEmail = sessionStorage.getItem('otp_email');

        if (otpInput === storedOtp && details.email === storedEmail) {
            setError('');
            sessionStorage.removeItem('otp');
            sessionStorage.removeItem('otp_email');
            onNext(details);
        } else {
            setError('The code you entered is incorrect. Please try again.');
        }
    };

    const isDetailsFormValid = details.fullName && details.address && details.phone && details.email;

    return (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Side: Form */}
                <div className="w-full">
                    {view === 'details' ? (
                        <form onSubmit={handleSendRequest} className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter Your Details</h2>
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" name="fullName" id="fullName" value={details.fullName} onChange={handleDetailsChange} placeholder="Enter full name here." required className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#00bfff] focus:border-[#00bfff]" />
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                                <input type="text" name="address" id="address" value={details.address} onChange={handleDetailsChange} placeholder="Enter address here." required className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#00bfff] focus:border-[#00bfff]" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="tel" name="phone" id="phone" value={details.phone} onChange={handleDetailsChange} placeholder="Enter phone number here." required className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#00bfff] focus:border-[#00bfff]" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" id="email" value={details.email} onChange={handleDetailsChange} placeholder="Enter email address here." required className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#00bfff] focus:border-[#00bfff]" />
                            </div>
                            {error && <p className="text-xs text-red-600">{error}</p>}
                            <button type="submit" disabled={!isDetailsFormValid || loading} className="w-full bg-[#00bfff] text-black font-bold py-3 px-4 rounded-md hover:bg-[#00aeee] transition-colors disabled:bg-gray-300 disabled:cursor-wait">
                                {loading ? 'Sending...' : 'SEND REQUEST'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter OTP</h2>
                            <p className="text-sm text-gray-600">An OTP has been sent to {details.email}. Please enter it below.</p>
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
                                <input type="text" name="otp" id="otp" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="Enter OTP" required maxLength={4} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#00bfff] focus:border-[#00bfff]" />
                            </div>
                            {error && <p className="text-xs text-red-600">{error}</p>}
                            
                            <div className="flex flex-col gap-3">
                                <button type="submit" disabled={loading} className="w-full bg-[#00bfff] text-black font-bold py-3 px-4 rounded-md hover:bg-[#00aeee] transition-colors disabled:bg-gray-300 disabled:cursor-wait">
                                    {loading ? 'Verifying...' : 'VERIFY OTP'}
                                </button>
                                
                                <button 
                                    type="button" 
                                    disabled={resendTimer > 0 || loading}
                                    onClick={handleSendRequest}
                                    className="w-full text-sm font-bold text-[#00bfff] disabled:text-gray-400 hover:underline transition-colors"
                                >
                                    {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
                                </button>
                            </div>

                            <button type="button" onClick={() => { setView('details'); setError(''); }} className="w-full text-xs text-center text-gray-500 hover:underline mt-4">
                                Change details?
                            </button>
                        </form>
                    )}
                </div>

                {/* Right Side: Mascot */}
                <div className="hidden md:flex flex-col items-center justify-center">
                    <div className="relative mb-4">
                        <div className="bg-white border border-gray-300 p-4 rounded-lg shadow-md w-64 text-center">
                            <p className="text-sm text-gray-700">
                                {view === 'details' ? "Enter your email address for OTP." : "Check your email for the OTP."}
                            </p>
                        </div>
                    </div>
                    <img src="https://ik.imagekit.io/fixedmyspeaker/mobile%20all%20modal%20logo/Modal/features/img%20002.png?updatedAt=1762964474181" alt="Mascot" className="h-48 w-auto" />
                </div>
            </div>
            <div className="mt-10 flex justify-start">
                <button
                    onClick={onBack}
                    className="bg-gray-300 text-black font-bold py-3 px-8 rounded-lg flex items-center gap-2 hover:bg-gray-400 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" /> PREVIOUS
                </button>
            </div>
        </div>
    );
};

export default OtpStep;
