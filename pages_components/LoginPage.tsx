import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ExclamationTriangleIcon } from '../components/icons/ExclamationTriangleIcon';
import * as api from '../services/api';
import * as biometricService from '../services/biometricService';
import { FaceIdIcon } from '../components/icons/FaceIdIcon';
import { FingerPrintIcon } from '../components/icons/FingerPrintIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { EyeSlashIcon } from '../components/icons/EyeSlashIcon';
import { LockClosedIcon } from '../components/icons/LockClosedIcon';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';
import { DevicePhoneMobileIcon } from '../components/icons/DevicePhoneMobileIcon';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import confetti from 'canvas-confetti';
import DesktopAuthSlider from '../components/DesktopAuthSlider';
import { formatAuthErrorMessage } from '../utils/authErrors';

export interface LoginPageProps {
  navigate: (path: string) => void;
  showUnauthorizedMessage?: boolean;
}

const ADMIN_EMAILS = [
  'mobistorestore@gmail.com',
  'avaymishra11@gmail.com',
  'sandy0405pandey@gmail.com',
  'bipin91116bi@gmail.com',
];

const LoginPage: React.FC<LoginPageProps> = ({ navigate, showUnauthorizedMessage = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUnauthorizedMessageState, setShowUnauthorizedMessageState] = useState(showUnauthorizedMessage);

  const [showNewPasswordScreen, setShowNewPasswordScreen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isForgotPasswordFlow, setIsForgotPasswordFlow] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { loginWithGoogle, loginWithEmail, loginWithBiometric, resetPassword, sendEmailOtp, verifyEmailOtp, resetPasswordWithOtp, user } = useAuth();
  const [biometricType, setBiometricType] = useState<'FaceID' | 'Fingerprint' | 'Biometrics' | null>(biometricService.getBiometricType());

  // Desktop Hero Slider Content
  const DEFAULT_HERO_SLIDES = [
    {
      bg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80',
      icon: (
        <div key="icon-1" className="w-24 h-24 mb-6 relative">
          <div className="absolute inset-0 bg-orange-400/20 blur-xl rounded-full"></div>
          <svg viewBox="0 0 80 80" className="w-full h-full relative z-10 drop-shadow-2xl">
            <circle cx="40" cy="40" r="36" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" />
            <path d="M40 18C27.85 18 18 27.85 18 40C18 52.15 27.85 62 40 62C52.15 62 62 52.15 62 40" stroke="#34d399" strokeWidth="3" strokeLinecap="round" fill="none" />
            <polyline points="62,40 62,28 50,28" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="40" cy="40" r="10" fill="#34d399" fillOpacity="0.4" />
          </svg>
        </div>
      ),
      title: 'Recycle Smarter',
      subtitle: "Turn your old devices into cash instantly with Nepal's most trusted e-waste buyback program.",
    },
    {
      bg: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80',
      icon: (
        <div key="icon-2" className="w-24 h-24 mb-6 relative">
          <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full"></div>
          <svg viewBox="0 0 80 80" className="w-full h-full relative z-10 drop-shadow-2xl">
            <circle cx="40" cy="40" r="36" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" />
            <rect x="22" y="20" width="36" height="48" rx="5" stroke="white" strokeWidth="2" fill="none" strokeOpacity="0.3" />
            <rect x="28" y="14" width="24" height="36" rx="4" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" />
            <circle cx="40" cy="32" r="6" fill="#3b82f6" />
          </svg>
        </div>
      ),
      title: 'Earn Rewards',
      subtitle: 'Get points on every trade-in, purchase & referral. Redeem them for exclusive discounts and prizes.',
    },
    {
      bg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&q=80',
      icon: (
        <div key="icon-3" className="w-24 h-24 mb-6 relative">
          <div className="absolute inset-0 bg-purple-400/20 blur-xl rounded-full"></div>
          <svg viewBox="0 0 80 80" className="w-full h-full relative z-10 drop-shadow-2xl">
            <circle cx="40" cy="40" r="36" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" />
            <path d="M40 20 L46 34 L62 34 L49 43 L54 58 L40 49 L26 58 L31 43 L18 34 L34 34 Z" fill="#a855f7" fillOpacity="0.4" stroke="#a855f7" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
      ),
      title: 'Verified Store',
      subtitle: 'Rated 5 stars by thousands of customers. Secure payments, quick service & genuine products only.',
    },
  ];

  const [heroSlides, setHeroSlides] = useState(DEFAULT_HERO_SLIDES);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    // Check if biometric is available
    const checkBiometric = async () => {
      const hasCred = await biometricService.hasBiometricCredential();
      if (hasCred) setBiometricType(biometricService.getBiometricType());
    };
    checkBiometric();

    const params = new URLSearchParams(window.location.search);
    if (params.get('unauthorized')) setShowUnauthorizedMessageState(true);

    const renderGoogleButton = () => {
      const gbtn = document.getElementById('google-signin-button');
      if (window.google?.accounts?.id && gbtn && gbtn.innerHTML === "") {
        window.google.accounts.id.renderButton(gbtn, { theme: 'outline', size: 'large', width: gbtn.offsetWidth || 300, shape: 'pill', text: 'signin_with' });
      }
    };
    const gInterval = setInterval(renderGoogleButton, 500);
    setTimeout(() => clearInterval(gInterval), 5000);

    let resendInterval: any;
    if (resendTimer > 0) resendInterval = setInterval(() => setResendTimer((prev: number) => prev - 1), 1000);

    return () => { clearInterval(gInterval); clearInterval(resendInterval); };
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await sendEmailOtp(email);
      setOtpSent(true);
      setOtpVerified(false);
      setResendTimer(60);
    } catch (err: any) { setError(formatAuthErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      // Verify OTP first — this is the security gate
      const isValid = await verifyEmailOtp(email, otpCode.join(''), true);
      if (isValid) {
        // OTP confirmed: now securely trigger the Firebase password reset email
        await resetPasswordWithOtp(email, otpCode.join(''));
        setOtpVerified(true);
        setResetSuccess(true);
        setError('');
      } else {
        setError('The code you entered is incorrect or expired.');
      }
    } catch (err: any) { setError(formatAuthErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleRedirect = (loggedInUser: any) => {
    if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      if (loggedInUser.email && ADMIN_EMAILS.includes(loggedInUser.email)) navigate('/admin/dashboard');
      else navigate('/profile');
    }, 300);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const firebaseUser = await loginWithEmail(email, password);
      handleRedirect(firebaseUser);
    } catch (err: any) {
      setError(formatAuthErrorMessage(err));
      setLoading(false);
    }
  };

  if (user && !otpSent && !isForgotPasswordFlow) { navigate('/profile'); return null; }

  // --- Step 1: Forgot Password (Request Link Screen) ---
  if (isForgotPasswordFlow && !otpSent && !resetSuccess) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex w-full h-full overflow-hidden font-sans">
        <DesktopAuthSlider />
        
        {/* Right Side / Mobile Full: Form Container */}
        <div className="w-full md:w-1/2 h-full relative flex flex-col items-center justify-center">
        
        {/* Top Wave */}
        <div className="absolute top-0 left-0 right-0 w-full z-0 pointer-events-none md:hidden leading-none">
          <svg viewBox="0 0 1440 250" className="w-full object-cover" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '18vh' }}>
            <defs><linearGradient id="wave-top-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#b5123d" /><stop offset="100%" stopColor="#8a0928" /></linearGradient></defs>
            <path fill="url(#wave-top-grad)" d="M0,0 L1440,0 L1440,80 C960,250 480,-50 0,160 Z" />
          </svg>
        </div>

        {/* Bottom Mobile Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none md:hidden leading-none">
          <svg viewBox="0 0 1440 250" className="w-full object-cover" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '18vh' }}>
            <defs>
              <linearGradient id="wave-bottom-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a0928" />
                <stop offset="100%" stopColor="#b5123d" />
              </linearGradient>
            </defs>
            <path fill="url(#wave-bottom-grad)" d="M0,250 L1440,250 L1440,90 C960,300 480,0 0,160 Z" />
          </svg>
        </div>

        {/* --- DESKTOP WAVES (New, totally separate from mobile) --- */}
        <div className="absolute top-0 left-0 right-0 w-full z-0 pointer-events-none hidden md:block leading-none">
          <svg viewBox="0 0 1440 320" className="w-full object-cover drop-shadow-sm" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '15vh' }}>
            <defs><linearGradient id="wave-desktop-top" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#b5123d" /><stop offset="100%" stopColor="#8a0928" /></linearGradient></defs>
            <path fill="url(#wave-desktop-top)" d="M0,0 L1440,0 L1440,50 C900,120 400,320 0,280 Z" />
          </svg>
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none hidden md:block leading-none">
          <svg viewBox="0 0 1440 320" className="w-full object-cover drop-shadow-sm" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '15vh' }}>
            <defs><linearGradient id="wave-desktop-bottom" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8a0928" /><stop offset="100%" stopColor="#b5123d" /></linearGradient></defs>
            <path fill="url(#wave-desktop-bottom)" d="M0,320 L1440,320 L1440,40 C900,0 400,200 0,270 Z" />
          </svg>
        </div>

        <div className="max-w-md w-full relative z-10 text-center animate-in fade-in zoom-in duration-300 px-6">
          <button onClick={() => setIsForgotPasswordFlow(false)} className="absolute -top-12 left-6 w-10 h-10 bg-gray-100/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"><ChevronLeftIcon className="w-6 h-6 text-black"/></button>
          
          <div className="flex justify-center mb-6">
            <img src="/assets/auth/forgot.svg" alt="Illustration" className="w-56 h-auto drop-shadow-sm" />
          </div>

          <h1 className="text-2xl font-bold text-black mb-1">Forgot Password</h1>
          <p className="text-gray-500 text-sm mb-8 px-2">Enter the email associated with your account to receive a secure password reset link.</p>
          
          <div className="flex flex-col gap-2 text-left mb-6">
            <label className="text-xs font-semibold text-gray-700 ml-1">Email Address</label>
            <div className="relative group">
              <input type="email" required placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/90 backdrop-blur-sm border border-gray-300 rounded-[24px] pl-5 pr-11 py-3 text-black font-medium placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm" />
              <div className="absolute right-4 top-3 text-gray-400 group-focus-within:text-black transition-colors"><EnvelopeIcon className="w-5 h-5" /></div>
            </div>
          </div>

          {error && <p className="text-xs text-rose-500 mb-6 font-medium">{error}</p>}

          <button onClick={handleSendOtp} disabled={loading} className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-full font-semibold text-base shadow-lg active:scale-95 transition-all">
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </div>
        </div>
      </div>
    );
  }

  // --- Step 2: Verify OTP Screen ---
  if (otpSent && !otpVerified) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex w-full h-full overflow-hidden font-sans">
        <DesktopAuthSlider />
        
        <div className="w-full md:w-1/2 h-full relative flex flex-col items-center justify-center">
        
        {/* Top Wave */}
        <div className="absolute top-0 left-0 right-0 w-full z-0 pointer-events-none md:hidden leading-none">
          <svg viewBox="0 0 1440 250" className="w-full object-cover" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '18vh' }}>
            <defs><linearGradient id="wave-top-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#b5123d" /><stop offset="100%" stopColor="#8a0928" /></linearGradient></defs>
            <path fill="url(#wave-top-grad)" d="M0,0 L1440,0 L1440,80 C960,250 480,-50 0,160 Z" />
          </svg>
        </div>

        {/* Bottom Mobile Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none md:hidden leading-none">
          <svg viewBox="0 0 1440 250" className="w-full object-cover" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '18vh' }}>
            <defs>
              <linearGradient id="wave-bottom-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a0928" />
                <stop offset="100%" stopColor="#b5123d" />
              </linearGradient>
            </defs>
            <path fill="url(#wave-bottom-grad)" d="M0,250 L1440,250 L1440,90 C960,300 480,0 0,160 Z" />
          </svg>
        </div>

        {/* --- DESKTOP WAVES (New, totally separate from mobile) --- */}
        <div className="absolute top-0 left-0 right-0 w-full z-0 pointer-events-none hidden md:block leading-none">
          <svg viewBox="0 0 1440 320" className="w-full object-cover drop-shadow-sm" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '15vh' }}>
            <defs><linearGradient id="wave-desktop-top" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#b5123d" /><stop offset="100%" stopColor="#8a0928" /></linearGradient></defs>
            <path fill="url(#wave-desktop-top)" d="M0,0 L1440,0 L1440,50 C900,120 400,320 0,280 Z" />
          </svg>
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none hidden md:block leading-none">
          <svg viewBox="0 0 1440 320" className="w-full object-cover drop-shadow-sm" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '15vh' }}>
            <defs><linearGradient id="wave-desktop-bottom" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8a0928" /><stop offset="100%" stopColor="#b5123d" /></linearGradient></defs>
            <path fill="url(#wave-desktop-bottom)" d="M0,320 L1440,320 L1440,40 C900,0 400,200 0,270 Z" />
          </svg>
        </div>

        <div className="max-w-md w-full relative z-10 text-center animate-in fade-in zoom-in duration-300 px-6">
          <button onClick={() => setOtpSent(false)} className="absolute -top-12 left-6 w-10 h-10 bg-gray-100/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"><ChevronLeftIcon className="w-6 h-6 text-black"/></button>
          
          <div className="flex justify-center mb-6">
            <img src="/assets/auth/forgot.svg" alt="Verify" className="w-56 h-auto drop-shadow-sm" />
          </div>

          <h1 className="text-2xl font-bold text-black mb-1">Enter OTP</h1>
          <p className="text-gray-500 text-sm mb-8">A 6 digit OTP has been sent to <br/><span className="text-black font-semibold">{email}</span></p>
          
          <div className="flex justify-center gap-2 mb-8">
            {otpCode.map((digit, idx) => (
              <input key={idx} id={`otp-${idx}`} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)} 
                className="w-12 h-14 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-2xl text-center text-xl font-bold text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
            ))}
          </div>

          {error && <p className="text-xs text-rose-500 mb-6 font-medium pr-2">{error}</p>}

          <button onClick={handleVerifyOtp} disabled={loading} className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-full font-semibold text-base shadow-lg active:scale-95 transition-all">
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <p className="mt-8 text-sm text-gray-500 font-medium">
            Resend OTP {resendTimer > 0 ? <span className="text-black font-bold">({resendTimer})</span> : <button onClick={handleSendOtp} className="text-black font-bold underline">Now</button>}
          </p>
        </div>
        </div>
      </div>
    );
  }


  // --- Step 3: Success Screen ---
  if (isForgotPasswordFlow && resetSuccess) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex w-full h-full overflow-hidden font-sans">
        <DesktopAuthSlider />
        
        <div className="w-full md:w-1/2 h-full relative flex flex-col items-center justify-center">
        
        {/* Top Wave */}
        <div className="absolute top-0 left-0 right-0 w-full z-0 pointer-events-none md:hidden leading-none">
          <svg viewBox="0 0 1440 250" className="w-full object-cover" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '18vh' }}>
            <defs><linearGradient id="wave-top-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#b5123d" /><stop offset="100%" stopColor="#8a0928" /></linearGradient></defs>
            <path fill="url(#wave-top-grad)" d="M0,0 L1440,0 L1440,80 C960,250 480,-50 0,160 Z" />
          </svg>
        </div>

        {/* Bottom Mobile Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none md:hidden leading-none">
          <svg viewBox="0 0 1440 250" className="w-full object-cover" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '18vh' }}>
            <defs>
              <linearGradient id="wave-bottom-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a0928" />
                <stop offset="100%" stopColor="#b5123d" />
              </linearGradient>
            </defs>
            <path fill="url(#wave-bottom-grad)" d="M0,250 L1440,250 L1440,90 C960,300 480,0 0,160 Z" />
          </svg>
        </div>

        {/* --- DESKTOP WAVES (New, totally separate from mobile) --- */}
        <div className="absolute top-0 left-0 right-0 w-full z-0 pointer-events-none hidden md:block leading-none">
          <svg viewBox="0 0 1440 320" className="w-full object-cover drop-shadow-sm" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '15vh' }}>
            <defs><linearGradient id="wave-desktop-top" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#b5123d" /><stop offset="100%" stopColor="#8a0928" /></linearGradient></defs>
            <path fill="url(#wave-desktop-top)" d="M0,0 L1440,0 L1440,50 C900,120 400,320 0,280 Z" />
          </svg>
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none hidden md:block leading-none">
          <svg viewBox="0 0 1440 320" className="w-full object-cover drop-shadow-sm" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '15vh' }}>
            <defs><linearGradient id="wave-desktop-bottom" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8a0928" /><stop offset="100%" stopColor="#b5123d" /></linearGradient></defs>
            <path fill="url(#wave-desktop-bottom)" d="M0,320 L1440,320 L1440,40 C900,0 400,200 0,270 Z" />
          </svg>
        </div>

        <div className="max-w-md w-full relative z-10 px-6 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheckIcon className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Check Your Email!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Your identity was verified. A secure password reset link has been sent to<br/>
            <span className="text-black font-semibold">{email}</span>.<br/>
            Click the link in your email to set a new password.
          </p>

          <button onClick={() => { setResetSuccess(false); setIsForgotPasswordFlow(false); setOtpSent(false); setOtpVerified(false); }} 
             className="w-full h-12 bg-black text-white rounded-full font-semibold active:scale-95 transition-all shadow-lg">Back to Login</button>
        </div>
        </div>
      </div>
    );
  }

  // Note: The previous success screen code was merged into Step 2 above

  // --- MAIN LOGIN SCREEN (Minimalist Black & White Design) ---
  return (
    <div className="fixed inset-0 z-[100] bg-white flex w-full h-full overflow-hidden font-sans">
      <DesktopAuthSlider />

      <div className="w-full md:w-1/2 h-full relative flex flex-col items-center justify-center touch-none">

      {/* Top Mobile Wave SVG */}
      <div className="absolute top-0 left-0 right-0 w-full z-0 pointer-events-none md:hidden leading-none">
        <svg viewBox="0 0 1440 250" className="w-full object-cover" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '18vh' }}>
          <defs>
            <linearGradient id="wave-top-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b5123d" />
              <stop offset="100%" stopColor="#8a0928" />
            </linearGradient>
          </defs>
          <path fill="url(#wave-top-grad)" d="M0,0 L1440,0 L1440,80 C960,250 480,-50 0,160 Z" />
        </svg>
      </div>

      {/* Bottom Mobile Wave SVG */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none md:hidden leading-none">
        <svg viewBox="0 0 1440 250" className="w-full object-cover" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '14vh' }}>
          <defs>
            <linearGradient id="wave-bottom-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8a0928" />
              <stop offset="100%" stopColor="#b5123d" />
            </linearGradient>
          </defs>
          <path fill="url(#wave-bottom-grad)" d="M0,250 L1440,250 L1440,120 C960,280 480,40 0,180 Z" />
        </svg>
      </div>

      {/* --- DESKTOP WAVES (New, totally separate from mobile) --- */}
      <div className="absolute top-0 left-0 right-0 w-full z-0 pointer-events-none hidden md:block leading-none">
        <svg viewBox="0 0 1440 320" className="w-full object-cover drop-shadow-sm" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '15vh' }}>
          <defs><linearGradient id="wave-desktop-top" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#b5123d" /><stop offset="100%" stopColor="#8a0928" /></linearGradient></defs>
          <path fill="url(#wave-desktop-top)" d="M0,0 L1440,0 L1440,50 C900,120 400,320 0,280 Z" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none hidden md:block leading-none">
        <svg viewBox="0 0 1440 320" className="w-full object-cover drop-shadow-sm" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '15vh' }}>
          <defs><linearGradient id="wave-desktop-bottom" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8a0928" /><stop offset="100%" stopColor="#b5123d" /></linearGradient></defs>
          <path fill="url(#wave-desktop-bottom)" d="M0,320 L1440,320 L1440,270 C900,200 400,0 0,40 Z" />
        </svg>
      </div>

      {/* Center Content Area */}
      <div className="absolute inset-0 flex flex-col justify-start pt-[10vh] items-center w-full z-10 px-6 overflow-y-auto">
        <div className="max-w-md w-full py-2 flex flex-col justify-center min-h-0">
          {/* Logo */}
          <div className="w-full flex justify-start mb-2">
            <img 
              src="https://ik.imagekit.io/fixedmyspeaker/main%20logo.PNG" 
              alt="Mobi Store Logo" 
              className="h-10 w-auto object-contain brightness-0"
            />
          </div>

          {/* Top Illustration */}
          <div className="flex justify-center mb-1">
            <img 
              src="/assets/auth/login.svg" 
              alt="Login Illustration" 
              className="w-32 h-auto drop-shadow-md" 
            />
          </div>

          <div className="flex justify-center mb-1 shrink-0">
            <h1 className="text-xl font-bold text-black tracking-wide">Login</h1>
          </div>

          {showUnauthorizedMessageState && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-rose-500 shrink-0" /> Admin access required.
          </div>}

          <form onSubmit={handleEmailLogin} className="space-y-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 ml-1">Enter your Email or Username</label>
              <div className="relative group">
                <input type="email" required placeholder="+91 1712345678" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-gray-300 rounded-[24px] pl-5 pr-11 py-3 text-black font-medium placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm" />
                <div className="absolute right-4 top-3 text-gray-400"><UserIcon className="w-5 h-5" /></div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 ml-1">Enter your password</label>
              <div className="relative group">
                <input type={showPassword ? 'text' : 'password'} required placeholder="***************" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-gray-300 rounded-[24px] pl-5 pr-11 py-3 text-black font-medium placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-gray-400 hover:text-black transition-colors">{showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}</button>
              </div>
            </div>

            <div className="flex justify-between items-center px-1 pt-1 gap-2">
              {error ? (
                <p className="text-xs text-rose-600 font-semibold animate-shake leading-snug">{error}</p>
              ) : <div className="shrink"></div>}
               <button type="button" onClick={() => setIsForgotPasswordFlow(true)} className="text-[13px] font-medium text-gray-500 hover:text-black transition-colors shrink-0 whitespace-nowrap ml-auto">forgot password?</button>
            </div>

            <div className="pt-2 flex gap-3">
              <button onClick={handleEmailLogin} disabled={loading} className="flex-grow h-12 bg-black hover:bg-gray-900 text-white rounded-[24px] font-semibold text-base shadow-lg active:scale-95 transition-all flex items-center justify-center">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Login'}
              </button>
              {biometricType && (
                <button type="button" onClick={async () => { setLoading(true); try { const id = await biometricService.authenticateBiometric(); if (id) await loginWithBiometric(id); } finally { setLoading(false); } }}
                  className="w-12 h-12 bg-black text-white rounded-[24px] flex items-center justify-center active:scale-95 transition-all shadow-lg shrink-0 border border-gray-800">
                  {biometricType === 'FaceID' ? <FaceIdIcon className="w-6 h-6" /> : <FingerPrintIcon className="w-6 h-6" />}
                </button>
              )}
            </div>
          </form>

          <div className="mt-4 flex flex-col items-center">
            <p className="text-sm font-medium text-gray-500">Don't have an account? <button onClick={() => navigate('/signup')} className="text-black font-bold hover:underline ml-1">Sign Up</button></p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;
