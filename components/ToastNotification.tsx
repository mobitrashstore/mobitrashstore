import React, { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { Notification, NotificationType } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { XMarkIcon } from './icons/XMarkIcon';

const styles: {
  [key in NotificationType]: {
    iconBg: string;
    iconColor: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    title: string;
    progressBar: string;
  };
} = {
  success: { 
      iconBg: 'bg-gradient-to-br from-orange-400 to-orange-600', 
      iconColor: 'text-white', 
      Icon: CheckCircleIcon,
      title: 'Success',
      progressBar: 'bg-orange-500'
  },
  info: { 
      iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-600', 
      iconColor: 'text-white', 
      Icon: InformationCircleIcon,
      title: 'Note',
      progressBar: 'bg-blue-500'
  },
  error: { 
      iconBg: 'bg-gradient-to-br from-rose-400 to-red-600', 
      iconColor: 'text-white', 
      Icon: ExclamationTriangleIcon,
      title: 'Error',
      progressBar: 'bg-rose-500'
  },
};

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const Toast: React.FC<{ notification: Notification; onRemove: (id: number) => void }> = ({ notification, onRemove }) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, 4500); // 4.5 seconds

      return () => clearTimeout(timer);
    }, [notification, onRemove]);

    const style = styles[notification.type];

    return (
      <div 
        role="alert"
        className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl border border-white/50 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden animate-toast-in mb-3 pointer-events-auto ring-1 ring-black/5"
      >
        {/* Main Content */}
        <div className="p-4 flex items-start gap-4">
            
            {/* Vivid Icon Container */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center shadow-md ring-2 ring-white`}>
              <style.Icon className={`w-5 h-5 ${style.iconColor}`} />
            </div>
            
            {/* Text Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">{style.title}</h3>
              <p className="text-sm text-gray-600 font-medium leading-snug">{notification.message}</p>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => onRemove(notification.id)}
              className="flex-shrink-0 -mt-1 -mr-1 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-4 w-4" />
            </button>
        </div>

        {/* Sleek Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-100">
            <div 
                className={`h-full ${style.progressBar} animate-progress`} 
                style={{ animationDuration: '4500ms' }}
            ></div>
        </div>
      </div>
    );
  };

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex flex-col items-center justify-start pointer-events-none z-[200] pt-16 px-4 sm:items-end sm:justify-start sm:pt-24 sm:pr-6"
    >
      {notifications.map((notification) => (
        <Toast key={notification.id} notification={notification} onRemove={removeNotification} />
      ))}
    </div>
  );
};
