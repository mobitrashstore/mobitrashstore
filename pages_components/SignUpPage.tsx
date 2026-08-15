import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bars3Icon } from '../components/icons/Bars3Icon';
import { UserIcon } from '../components/icons/UserIcon';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';
import { LockClosedIcon } from '../components/icons/LockClosedIcon'; // Imported but not used in the provided snippet
import { EyeIcon } from '../components/icons/EyeIcon';
import { EyeSlashIcon } from '../components/icons/EyeSlashIcon';
import * as api from '../services/api'; // Imported but not used in the provided snippet
import { ExclamationTriangleIcon } from '../components/icons/ExclamationTriangleIcon'; // Imported but not used in the provided snippet
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import DesktopAuthSlider from '../components/DesktopAuthSlider';
import { formatAuthErrorMessage } from '../utils/authErrors';

export interface SignUpPageProps {
  navigate: (path: string) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ navigate }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);

  const { loginWithGoogle, signUpWithEmail, sendEmailOtp, verifyEmailOtp, user } = useAuth();

  useEffect(() => {
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', '#b5123d');
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.style.backgroundColor = '#b5123d';
    }
    const globalBar = document.getElementById('global-mobile-status-bar');
    if (globalBar) {
      globalBar.style.backgroundColor = '#b5123d';
    }

    return () => {
      if (metaTheme) metaTheme.setAttribute('content', '#059669');
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.style.backgroundColor = '#059669';
      }
      if (globalBar) {
        globalBar.style.backgroundColor = '#059669';
      }
    };
  }, []);

  useEffect(() => {
    let googleRenderInterval: any;
    const renderGoogleButton = () => {
      const container = document.getElementById('google-signup-button');
      if (window.google?.accounts?.id && container && container.innerHTML === "") {
        window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: container.offsetWidth || 300, shape: 'pill', text: 'signup_with' });
      }
    };
    googleRenderInterval = setInterval(renderGoogleButton, 500);
    setTimeout(() => clearInterval(googleRenderInterval), 5000);

    let interval: any;
    if (resendTimer > 0) interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref != null) setReferralCode(ref.toUpperCase());

    return () => { clearInterval(interval); clearInterval(googleRenderInterval); };
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError('Please agree to terms & conditions.'); return; }
    setLoading(true);
    setError('');
    try {
      const fullName = `${firstName} ${lastName}`;
      await signUpWithEmail(fullName, email, password, referralCode);
      await sendEmailOtp(email);
      setOtpSent(true);
      setResendTimer(60);
    } catch (err: any) {
      setError(formatAuthErrorMessage(err));
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const isValid = await verifyEmailOtp(email, otpCode.join(''));
      if (isValid) navigate('/profile');
      else setError('The code you entered is incorrect or expired.');
    } catch (err) { setError(formatAuthErrorMessage(err)); }
    finally { setLoading(false); }
  };

  if (user && !otpSent) { navigate('/profile'); return null; }

  // --- OTP Verification Screen (Redesigned matching login) ---
  if (otpSent) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex w-full h-full overflow-hidden font-sans">
        <DesktopAuthSlider />

        <div className="w-full md:w-1/2 h-full relative flex flex-col items-center justify-center">
        
        {/* Top Wave */}
        <div className="absolute top-0 left-0 right-0 w-full z-0 pointer-events-none md:hidden leading-none overflow-hidden h-24">
          <svg viewBox="0 0 1440 200" className="w-full h-full object-cover" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="wave-top-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#b5123d" /><stop offset="100%" stopColor="#8a0928" /></linearGradient></defs>
            <path fill="url(#wave-top-grad)" d="M0,0 L1440,0 L1440,80 C1000,160 500,40 0,100 Z" />
          </svg>
        </div>

        {/* Bottom Mobile Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none md:hidden leading-none overflow-hidden h-20">
          <svg viewBox="0 0 1440 200" className="w-full h-full object-cover" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wave-bottom-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a0928" />
                <stop offset="100%" stopColor="#b5123d" />
              </linearGradient>
            </defs>
            <path fill="url(#wave-bottom-grad)" d="M0,200 L1440,200 L1440,100 C1000,30 480,180 0,90 Z" />
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

        <div className="max-w-md w-full relative z-10 px-6 text-center animate-in fade-in zoom-in duration-300">
          <button onClick={() => setOtpSent(false)} className="absolute -top-12 left-6 w-10 h-10 bg-gray-100/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"><ChevronLeftIcon className="w-6 h-6 text-black" /></button>

          <div className="flex justify-center mb-6">
            <img
              src="/assets/auth/signup.svg"
              alt="Security Illustration"
              className="w-56 h-auto rounded-3xl drop-shadow-lg"
            />
          </div>

          <h1 className="text-2xl font-bold text-black mb-1">Verify Email</h1>
          <p className="text-gray-500 text-sm mb-8 font-medium px-4">Enter the code sent to <br /><span className="text-black font-semibold">{email}</span></p>

          <div className="flex justify-center gap-2 mb-8">
            {otpCode.map((digit, idx) => (
              <input key={idx} id={`otp-${idx}`} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)}
                className="w-12 h-14 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-2xl text-center text-xl font-bold text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
            ))}
          </div>

          <button onClick={handleVerifyOtp} disabled={loading} className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-full font-semibold text-base shadow-lg active:scale-95 transition-all">
            {loading ? 'Confirming...' : 'CONFIRM ACCOUNT'}
          </button>

          <button onClick={handleSignUp} disabled={resendTimer > 0} className="mt-8 text-sm text-gray-500 font-bold uppercase tracking-widest hover:text-black transition-colors">
            Resend {resendTimer > 0 ? `(${resendTimer}s)` : ''}
          </button>
        </div>
        </div>
      </div>
    );
  }

  // --- MAIN SIGN UP SCREEN (Minimalist Black & White Design) ---
  return (
    <div className="fixed inset-0 z-[100] bg-white flex w-full h-full overflow-hidden font-sans">
      <DesktopAuthSlider />

      <div className="w-full md:w-1/2 h-full relative flex flex-col items-center justify-center">

      {/* Top Mobile Wave SVG */}
      <div className="absolute top-0 left-0 right-0 w-full z-0 pointer-events-none md:hidden leading-none overflow-hidden h-24">
        <svg viewBox="0 0 1440 200" className="w-full h-full object-cover" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wave-top-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b5123d" />
              <stop offset="100%" stopColor="#8a0928" />
            </linearGradient>
          </defs>
          <path fill="url(#wave-top-grad)" d="M0,0 L1440,0 L1440,80 C1000,160 500,40 0,100 Z" />
        </svg>
      </div>

      {/* Bottom Mobile Wave SVG */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none md:hidden leading-none overflow-hidden h-20">
        <svg viewBox="0 0 1440 200" className="w-full h-full object-cover" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wave-bottom-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8a0928" />
              <stop offset="100%" stopColor="#b5123d" />
            </linearGradient>
          </defs>
          <path fill="url(#wave-bottom-grad)" d="M0,200 L1440,200 L1440,100 C1000,30 480,180 0,90 Z" />
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

      {/* Center Content Area */}
      <div className="absolute inset-0 flex flex-col justify-start pt-[calc(env(safe-area-inset-top,0px)+3rem)] items-center w-full z-10 px-6 overflow-y-auto">
        <div className="max-w-md w-full py-2 min-h-0">
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
              src="/assets/auth/signup.svg"
              alt="Protect Data Illustration"
              className="w-32 h-auto rounded-xl drop-shadow-md"
            />
          </div>

          {/* Top Header */}
          <div className="flex items-center justify-center mb-1 shrink-0 relative">
            <h1 className="text-xl font-bold text-black tracking-wide">Register</h1>
          </div>

          <form onSubmit={handleSignUp} className="space-y-2">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">Enter your Name</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <input type="text" required placeholder="First" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-transparent border border-gray-300 rounded-[24px] pl-4 pr-10 py-2.5 text-black font-medium placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm" />
                  <div className="absolute right-3.5 top-2.5 text-gray-400 group-focus-within:text-black transition-colors"><UserIcon className="w-5 h-5" /></div>
                </div>
                <div className="relative group">
                  <input type="text" required placeholder="Last" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-transparent border border-gray-300 rounded-[24px] pl-4 pr-10 py-2.5 text-black font-medium placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm" />
                  <div className="absolute right-3.5 top-2.5 text-gray-400 group-focus-within:text-black transition-colors"><UserIcon className="w-5 h-5" /></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">Enter your Email</label>
              <div className="relative group">
                <input type="email" required placeholder="abc12@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-gray-300 rounded-[24px] pl-5 pr-11 py-2.5 text-black font-medium placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm" />
                <div className="absolute right-4 top-2.5 text-gray-400 group-focus-within:text-black transition-colors"><EnvelopeIcon className="w-5 h-5" /></div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">Enter your password</label>
              <div className="relative group">
                <input type={showPassword ? 'text' : 'password'} required placeholder="***************" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-gray-300 rounded-[24px] pl-5 pr-11 py-2.5 text-black font-medium placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-2.5 text-gray-400 hover:text-black transition-colors">{showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}</button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">Promo Code (Optional)</label>
              <div className="relative group">
                <input type="text" placeholder="e.g. SAVE20" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="w-full bg-transparent border border-gray-300 rounded-[24px] pl-5 pr-11 py-2.5 text-black font-medium placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm uppercase" />
                <div className="absolute right-4 top-2.5 text-gray-400 group-focus-within:text-black transition-colors"><Bars3Icon className="w-5 h-5" /></div>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-2 pt-1">
              <input type="checkbox" id="signup-agreed" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 rounded-md accent-black cursor-pointer" />
              <label htmlFor="signup-agreed" className="text-[11px] font-medium text-gray-600 leading-none">I accept <button type="button" onClick={() => navigate('/terms')} className="text-black font-bold hover:underline">Terms</button> & <button type="button" onClick={() => navigate('/privacy')} className="text-black font-bold hover:underline">Privacy Policy</button></label>
            </div>

            {error && <p className="text-xs text-rose-600 font-semibold pl-2 animate-shake leading-snug">{error}</p>}

            <div className="pt-2">
              <button onClick={handleSignUp} disabled={loading} className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-[24px] font-semibold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-col items-center">
            <p className="text-sm font-medium text-gray-500">Already have an account? <button onClick={() => navigate('/login')} className="text-black font-bold hover:underline ml-1">Sign in</button></p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SignUpPage;
