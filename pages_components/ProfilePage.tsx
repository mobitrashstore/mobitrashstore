

import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVisualEditing } from '../context/VisualEditingContext';
import { useNotification } from '../context/NotificationContext';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';
import { PencilSquareIcon } from '../components/icons/PencilSquareIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import { ArchiveBoxIcon } from '../components/icons/ArchiveBoxIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { QuestionMarkCircleIcon } from '../components/icons/QuestionMarkCircleIcon';
import { TicketIcon } from '../components/icons/TicketIcon';
import { MapPinIcon } from '../components/icons/MapPinIcon';
import { StarIcon } from '../components/icons/StarIcon';
import { GiftIcon } from '../components/icons/GiftIcon';
import { ChatBubbleLeftRightIcon } from '../components/icons/ChatBubbleLeftRightIcon';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import { TruckIcon } from '../components/icons/TruckIcon';
import { ChartBarIcon } from '../components/icons/ChartBarIcon';
import { ArrowRightOnRectangleIcon } from '../components/icons/ArrowRightOnRectangleIcon';
import { CameraIcon } from '../components/icons/CameraIcon';
import { FacebookIcon } from '../components/icons/FacebookIcon';
import { WhatsAppIcon } from '../components/icons/WhatsAppIcon';
import { TikTokIcon } from '../components/icons/TikTokIcon';
import { InstagramIcon } from '../components/icons/InstagramIcon';
import { DevicePhoneMobileIcon } from '../components/icons/DevicePhoneMobileIcon';
import { WrenchIcon } from '../components/icons/WrenchIcon';
import { ExclamationTriangleIcon } from '../components/icons/ExclamationTriangleIcon';
import { FingerPrintIcon } from '../components/icons/FingerPrintIcon';
import { FaceIdIcon } from '../components/icons/FaceIdIcon';
import { PhotoIcon } from '../components/icons/PhotoIcon';
import { InformationCircleIcon } from '../components/icons/InformationCircleIcon';
import { DocumentCheckIcon } from '../components/icons/DocumentCheckIcon';
import Spinner from '../components/Spinner';
import * as biometricService from '../services/biometricService';
import CertificateModal from '../components/CertificateModal';
import { CalculatorIcon } from '../components/icons/CalculatorIcon';
import { ShoppingBagIcon } from '../components/icons/ShoppingBagIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { NewspaperIcon } from '../components/icons/NewspaperIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { SunIcon } from '../components/icons/SunIcon';
import { MoonIcon } from '../components/icons/MoonIcon';
import { ComputerDesktopIcon } from '../components/icons/ComputerDesktopIcon';
import { CheckIcon } from '../components/icons/CheckIcon';
import { useTheme } from '../context/ThemeContext';

export interface ProfilePageProps {
  navigate: (path: string) => void;
}

const ProfileLink: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  className?: string;
  iconBgClass?: string;
  isOpen?: boolean; // Added for rotation
}> = ({
  icon,
  title,
  subtitle,
  onClick,
  className = '',
  iconBgClass = 'bg-gray-50 text-gray-600',
  isOpen = false,
}) => (
    <button
      onClick={onClick}
      className={`group w-full flex items-center px-4 py-3 text-left hover:bg-gray-50/80 active:bg-gray-100 transition-all duration-200 ${className}`}
      title={subtitle || title}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${iconBgClass}`}
      >
        {icon}
      </div>
      <div className="flex-grow ml-3 overflow-hidden">
        <p className="font-bold text-gray-800 truncate text-sm group-hover:text-[#ff7b00] transition-colors">
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-gray-500 truncate mt-0.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gray-50 text-gray-300 group-hover:text-[#ff7b00] group-hover:bg-orange-50 transition-all duration-300 ${isOpen ? 'rotate-90 bg-orange-100 text-orange-50' : ''}`}>
        <ChevronRightIcon className="w-3.5 h-3.5" />
      </div>
    </button>
  );

const SubLink: React.FC<{ title: string; onClick: () => void }> = ({ title, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left pl-[4.5rem] pr-4 py-3 text-xs font-medium text-gray-500 hover:text-amber-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-amber-400 transition-all flex items-center"
  >
    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-3"></span>
    {title}
  </button>
);

const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { user, loading, logout, updateUserPhoto } = useAuth();
  const { isEditing, toggleEditing, canEdit } = useVisualEditing();
  const { addNotification } = useNotification();
  const [isUploading, setIsUploading] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePhotoClick = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  const handleBiometricSetup = async () => {
    if (!user) return;
    const type = biometricService.getBiometricType();
    let typeName = 'Biometrics';
    if (type === 'FaceID') typeName = 'Face ID / Touch ID';
    if (type === 'Fingerprint') typeName = 'Fingerprint';

    if (
      !window.confirm(
        `Do you want to enable ${typeName} login for this device? This will allow you to log in without a password.`
      )
    )
      return;

    try {
      const result = await biometricService.registerBiometric(user);
      if (result.success) {
        addNotification(
          `${typeName} enabled successfully! You can now use it to log in.`,
          'success'
        );
      } else {
        addNotification(result.message || `Failed to enable ${typeName}.`, 'error');
      }
    } catch (e) {
      addNotification(`Error enabling ${typeName}.`, 'error');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addNotification('Please select a valid image file.', 'error');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

          try {
            await updateUserPhoto(dataUrl);
            addNotification('Profile photo updated successfully!', 'success');
          } catch (error: any) {
            console.error('Failed to update profile photo', error);
            addNotification(error.message || 'Failed to update photo.', 'error');
          } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        } else {
          setIsUploading(false);
          addNotification('Browser does not support image processing.', 'error');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <UserCircleIcon className="w-16 h-16 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Account Required</h1>
        <p className="mt-2 text-gray-600 max-w-md mx-auto">
          Please log in to your account to view your profile.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="mt-6 bg-amber-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-amber-700 transition-colors shadow-md"
        >
          Log In / Sign Up
        </button>
      </div>
    );
  }

  const biometricType = biometricService.getBiometricType();
  let biometricLabel = 'Enable Biometrics';
  let BiometricIcon = FingerPrintIcon;

  if (biometricType === 'FaceID') {
    biometricLabel = 'Enable Face ID';
    BiometricIcon = FaceIdIcon;
  } else if (biometricType === 'Fingerprint') {
    biometricLabel = 'Enable Fingerprint';
    BiometricIcon = FingerPrintIcon;
  }

  return (
    <div className="bg-[#f4f5fb] min-h-full font-sans w-full overflow-x-hidden">
      {/* 
          HEADER – MATCHES STATUS BAR (#0f172a / #1e3a8a) 
          Using 'from-[#1e3a8a] via-[#1e3a8a]' ensures the top 60% of the header is solid navy
          to blend seamlessly with the mobile status bar (safe area).
      */}
      <div
        className="bg-gradient-to-b from-[#1e3a8a] via-[#1e3a8a] to-[#0f172a] text-white pb-20 shadow-md"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/30 shadow-sm">
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <UserCircleIcon className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="text-xs font-bold tracking-wide uppercase">
              My Profile
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="w-full px-4 sm:px-6 lg:px-8 -mt-14 relative z-10 max-w-5xl mx-auto pb-0">
        {/* 1. COMPACT PREMIUM USER CARD */}
        <div className="bg-white rounded-3xl p-4 md:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.08)] border border-orange-50/80 relative overflow-hidden mb-4">

          <div className="relative flex flex-col md:flex-row items-center md:items-center justify-between gap-4 pt-2">
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 text-center md:text-left">
              {/* Avatar */}
              <div
                className="relative cursor-pointer"
                onClick={handlePhotoClick}
                title="Change Profile Photo"
              >
                <div className="w-16 h-16 md:w-18 md:h-18 rounded-full p-[2px] bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] shadow-md">
                  <div className="w-full h-full rounded-full bg-white overflow-hidden relative">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className={`w-full h-full rounded-full object-cover transition-opacity duration-200 ${isUploading ? 'opacity-50' : ''
                          }`}
                      />
                    ) : (
                      <div
                        className={`w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 transition-opacity duration-200 ${isUploading ? 'opacity-50' : ''
                          }`}
                      >
                        <UserCircleIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>

                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="absolute bottom-0 right-0 bg-white text-orange-500 rounded-full p-1 shadow-sm transform transition-transform hover:scale-110 active:scale-90">
                    <CameraIcon className="w-3 h-3" />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* User info */}
              <div>
                <h1 className="text-base md:text-lg font-black text-gray-900 tracking-tight">
                  {user.name}
                </h1>
                <p className="text-[11px] md:text-xs font-medium text-gray-500">
                  {user.email || 'Guest User'}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  <span className="px-2.5 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-full border border-orange-100 uppercase tracking-wide">
                    {user.role === 'admin' ? 'Administrator' : 'Member'}
                  </span>
                  <span className="px-2.5 py-0.5 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-full shadow-sm border border-amber-300 uppercase tracking-wide">
                    {user.points || 0} Points
                  </span>
                </div>
              </div>
            </div>

            {/* Sign out button */}
            <button
              onClick={handleLogout}
              className="group flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#1e3a8a] to-[#0f172a] text-white font-bold rounded-full text-xs shadow-md hover:brightness-105 active:scale-95 transition-all"
              title="Sign Out"
            >
              <span>Sign Out</span>
              <span className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center">
                <ArrowRightOnRectangleIcon className="w-2.5 h-2.5" />
              </span>
            </button>
          </div>
        </div>

        {/* 2. QUICK ACTIONS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {[
            {
              label: 'Orders',
              icon: ArchiveBoxIcon,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              border: 'border-blue-100',
              path: '/order-history',
            },
            {
              label: 'Wishlist',
              icon: HeartIcon,
              color: 'text-rose-500',
              bg: 'bg-rose-50',
              border: 'border-rose-100',
              path: '/wishlist',
            },
            {
              label: 'Track',
              icon: TruckIcon,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              border: 'border-amber-100',
              path: '/track',
            },
            {
              label: 'Coupons',
              icon: TicketIcon,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              border: 'border-emerald-100',
              path: '/coupons',
            },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className="relative bg-white p-2 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden"
              title={action.label}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-white via-transparent to-orange-50/60" />
              <div
                className={`w-8 h-8 ${action.bg} ${action.color} rounded-lg flex items-center justify-center mb-1 shadow-sm group-hover:scale-105 transition-transform duration-200 border ${action.border} relative z-10`}
              >
                <action.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-gray-800 relative z-10 group-hover:text-gray-900">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* 3. SETTINGS + SERVICES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Settings */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-5 pt-4 pb-2 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-gray-900" />
                Settings
              </h2>
            </div>
            <div className="divide-y divide-gray-50 p-1.5">
              {user.role === 'admin' && (
                <ProfileLink
                  icon={<ChartBarIcon className="w-4 h-4" />}
                  title="Admin Dashboard"
                  subtitle="Manage store & inventory"
                  onClick={() => navigate('/admin/dashboard')}
                  iconBgClass="bg-gray-900 text-white shadow-md shadow-slate-200"
                />
              )}
              {canEdit && (
                <ProfileLink
                  icon={<PencilSquareIcon className="w-4 h-4" />}
                  title={isEditing ? "Exit Visual Editor" : "Enable Visual Editor"}
                  subtitle="Edit site content directly"
                  onClick={toggleEditing}
                  iconBgClass={isEditing ? "bg-amber-500 text-white" : "bg-indigo-50 text-indigo-500"}
                  isOpen={false}
                />
              )}
              <ProfileLink
                icon={<MapPinIcon className="w-4 h-4" />}
                title="My Addresses"
                subtitle="Manage shipping details"
                onClick={() => navigate('/address')}
                iconBgClass="bg-orange-50 text-orange-500"
              />
              <ProfileLink
                icon={<BiometricIcon className="w-4 h-4" />}
                title={biometricLabel}
                subtitle="Setup secure & fast login"
                onClick={handleBiometricSetup}
                iconBgClass="bg-purple-50 text-purple-500"
              />
              <ProfileLink
                icon={<ShieldCheckIcon className="w-4 h-4" />}
                title="Trust & Safety"
                subtitle="Certificates, Privacy & Security"
                onClick={() => navigate('/trust')}
                iconBgClass="bg-green-50 text-green-600"
              />
              <div className="md:hidden">
                <ProfileLink
                  icon={
                    theme === 'light' ? <SunIcon className="w-4 h-4" /> :
                      theme === 'dark' ? <MoonIcon className="w-4 h-4" /> :
                        <ComputerDesktopIcon className="w-4 h-4" />
                  }
                  title="Appearance"
                  subtitle={`${theme.charAt(0).toUpperCase() + theme.slice(1)} Mode`}
                  onClick={() => setIsAppearanceOpen(!isAppearanceOpen)}
                  iconBgClass="bg-blue-50 text-blue-500"
                  isOpen={isAppearanceOpen}
                />
                {isAppearanceOpen && (
                  <div className="bg-slate-50/50 border-t border-slate-100 animate-fade-in-down origin-top">
                    <button
                      onClick={() => setTheme('light')}
                      className={`w-full text-left pl-[4.5rem] pr-4 py-3 text-xs font-medium ${theme === 'light' ? 'text-amber-600 bg-amber-50 border-l-4 border-amber-400' : 'text-gray-500 hover:text-amber-600 hover:bg-gray-50 border-l-4 border-transparent'} transition-all flex items-center justify-between`}
                    >
                      <div className="flex items-center">
                        <SunIcon className="w-3.5 h-3.5 mr-3 opacity-70" />
                        Light Mode
                      </div>
                      {theme === 'light' && <CheckIcon className="w-3 h-3 text-amber-600 mr-4" />}
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`w-full text-left pl-[4.5rem] pr-4 py-3 text-xs font-medium ${theme === 'dark' ? 'text-amber-600 bg-amber-50 border-l-4 border-amber-400' : 'text-gray-500 hover:text-amber-600 hover:bg-gray-50 border-l-4 border-transparent'} transition-all flex items-center justify-between`}
                    >
                      <div className="flex items-center">
                        <MoonIcon className="w-3.5 h-3.5 mr-3 opacity-70" />
                        Dark Mode
                      </div>
                      {theme === 'dark' && <CheckIcon className="w-3 h-3 text-amber-600 mr-4" />}
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`w-full text-left pl-[4.5rem] pr-4 py-3 text-xs font-medium ${theme === 'system' ? 'text-amber-600 bg-amber-50 border-l-4 border-amber-400' : 'text-gray-500 hover:text-amber-600 hover:bg-gray-50 border-l-4 border-transparent'} transition-all flex items-center justify-between`}
                    >
                      <div className="flex items-center">
                        <ComputerDesktopIcon className="w-3.5 h-3.5 mr-3 opacity-70" />
                        System Default
                      </div>
                      {theme === 'system' && <CheckIcon className="w-3 h-3 text-amber-600 mr-4" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Services & Support (mobile only to avoid duplicates) */}
          <div className="md:hidden bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-5 pt-4 pb-2 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-[#ff8a00]" />
                Services & Support
              </h2>
            </div>
            <div className="divide-y divide-gray-50 p-1.5">
              <ProfileLink
                icon={<WrenchIcon className="w-4 h-4" />}
                title="Book a Repair"
                subtitle="Screen, battery, and more"
                onClick={() => navigate('/repair')}
                iconBgClass="bg-blue-50 text-blue-500"
              />
              <ProfileLink
                icon={<ShoppingBagIcon className="w-4 h-4" />}
                title="Request a Product"
                subtitle="Can't find it? We'll get it"
                onClick={() => navigate('/request-product')}
                iconBgClass="bg-purple-50 text-purple-600"
              />

              {/* NEW NEPALI NEWS LINK */}
              <ProfileLink
                icon={<NewspaperIcon className="w-4 h-4" />}
                title="Nepali News"
                subtitle="Live Updates from Major Portals"
                onClick={() => navigate('/nepali-news')}
                iconBgClass="bg-rose-50 text-rose-600"
              />

              <ProfileLink
                icon={
                  <img
                    src="https://cdni.iconscout.com/illustration/premium/thumb/man-spinning-lucky-wheel-illustration-svg-download-png-13116182.png"
                    alt="Spin"
                    className="w-full h-full object-cover"
                  />
                }
                title="Spin & Win"
                subtitle="Daily rewards & prizes"
                onClick={() => navigate('/spin-win')}
                iconBgClass="bg-amber-100 text-amber-500 overflow-hidden"
              />
              <ProfileLink
                icon={<CalculatorIcon className="w-4 h-4" />}
                title="EMI Calculator"
                subtitle="Plan your payments"
                onClick={() => navigate('/emi-calculator')}
                iconBgClass="bg-emerald-50 text-emerald-600"
              />
              <ProfileLink
                icon={<GiftIcon className="w-4 h-4" />}
                title="Redeem Points"
                subtitle="Check your points and redeem it"
                onClick={() => navigate('/redeem-points')}
                iconBgClass="bg-pink-50 text-pink-500"
              />
              <ProfileLink
                icon={<PhotoIcon className="w-4 h-4" />}
                title="Gallery"
                subtitle="Photos & Videos"
                onClick={() => navigate('/gallery')}
                iconBgClass="bg-fuchsia-50 text-fuchsia-500"
              />
              <ProfileLink
                icon={<DevicePhoneMobileIcon className="w-4 h-4" />}
                title="Compare Phones"
                subtitle="Compare specs side-by-side"
                onClick={() => navigate('/compare')}
                iconBgClass="bg-cyan-50 text-cyan-600"
              />
              <ProfileLink
                icon={<StarIcon className="w-4 h-4" />}
                title="Rate our app"
                subtitle="Rate us on Play Store"
                onClick={() =>
                  window.open(
                    'https://play.google.com/store/apps/details?id=com.mobistore.store',
                    '_blank'
                  )
                }
                iconBgClass="bg-yellow-50 text-yellow-500"
              />
              <ProfileLink
                icon={<ExclamationTriangleIcon className="w-4 h-4" />}
                title="Report a Problem"
                subtitle="Found a bug? Let us know."
                onClick={() => navigate('/report-problem')}
                iconBgClass="bg-rose-50 text-rose-500"
              />
              <ProfileLink
                icon={<QuestionMarkCircleIcon className="w-4 h-4" />}
                title="Help Center"
                subtitle="Contact us for any help"
                onClick={() => navigate('/contact')}
                iconBgClass="bg-indigo-50 text-indigo-500"
              />
              <ProfileLink
                icon={<InformationCircleIcon className="w-4 h-4" />}
                title="About Us"
                subtitle="Our Story & Mission"
                onClick={() => navigate('/about')}
                iconBgClass="bg-emerald-50 text-emerald-600"
              />
              <ProfileLink
                icon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
                title="FAQ"
                subtitle="Common questions answered"
                onClick={() => navigate('/faq')}
                iconBgClass="bg-teal-50 text-teal-500"
              />

              {/* Expandable Legal Section */}
              <div className="relative">
                <ProfileLink
                  icon={<DocumentTextIcon className="w-4 h-4" />}
                  title="Legal & Policies"
                  subtitle="Terms, Privacy & Data"
                  onClick={() => setIsLegalOpen(!isLegalOpen)}
                  iconBgClass="bg-gray-100 text-gray-600"
                  isOpen={isLegalOpen}
                />

                {/* Smooth Dropdown for Legal Links */}
                {isLegalOpen && (
                  <div className="bg-slate-50/50 border-t border-slate-100 animate-fade-in-down origin-top">
                    <SubLink title="Shop Certificate" onClick={() => setShowCertificate(true)} />
                    <SubLink title="Terms of Service" onClick={() => navigate('/terms')} />
                    <SubLink title="Privacy Policy" onClick={() => navigate('/privacy')} />
                    <SubLink title="Cookies Policy" onClick={() => navigate('/cookies')} />
                    <SubLink title="Data Deletion" onClick={() => navigate('/data-deletion')} />
                  </div>
                )}
              </div>

              {/* DANGER ZONE: Account Deletion */}
              <div className="mt-4 p-4 bg-rose-50/50 border border-rose-100 rounded-2xl mx-1.5 mb-2">
                <h3 className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] mb-3 ml-1">Danger Zone</h3>
                <button
                  onClick={() => navigate('/data-deletion')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-rose-200 rounded-xl text-left hover:bg-rose-50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrashIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-rose-700">Request Account Deletion</p>
                    <p className="text-[10px] text-rose-400 font-medium">Permanently erase your data</p>
                  </div>
                  <ChevronRightIcon className="w-3.5 h-3.5 text-rose-300 ml-auto" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* 4. SOCIAL FOLLOW CARD */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden mt-6 p-6 text-center">
          <h2 className="text-base font-black text-gray-900 mb-4">
            Join Our Community
          </h2>
          <div className="flex justify-center gap-6 flex-wrap">
            {[
              {
                icon: FacebookIcon,
                color: '#1877F2',
                bg: 'bg-[#1877F2]/10',
                hoverBg: 'hover:bg-[#1877F2]',
                label: 'Facebook',
                url: 'https://www.facebook.com/share/17SwmmmU6f/?mibextid=wwXIfr',
              },
              {
                icon: TikTokIcon,
                color: '#000000',
                bg: 'bg-gray-100',
                hoverBg: 'hover:bg-black',
                label: 'TikTok',
                url: 'https://www.tiktok.com/@mobistoreapp?_r=1&_t=ZS-91M9tAbNqqK',
              },
              {
                icon: WhatsAppIcon,
                color: '#25D366',
                bg: 'bg-[#25D366]/10',
                hoverBg: 'hover:bg-[#25D366]',
                label: 'WhatsApp',
                url: 'https://wa.me/+9779812141777',
              },
              {
                icon: InstagramIcon,
                color: '#E4405F',
                bg: 'bg-[#E4405F]/10',
                hoverBg: 'hover:bg-[#E4405F]',
                label: 'Instagram',
                url: 'https://www.instagram.com/btmobile_care/?igsh=MXJpNWw0ejR2M3RhMA%3D%3D#',
              },
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-1.5"
                title={social.label}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${social.bg} ${social.hoverBg} transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:scale-110`}
                  style={{ color: social.color }}
                >
                  <social.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-800 transition-colors">
                  {social.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-2 text-center pb-4">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            Mobi Store v1.3.0
          </p>
        </div>
      </div>

      {showCertificate && <CertificateModal onClose={() => setShowCertificate(false)} />}
    </div>
  );
};

export default ProfilePage;
