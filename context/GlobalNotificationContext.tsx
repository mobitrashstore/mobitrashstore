

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { db } from '../services/firebase';
import { GlobalNotification } from '../types';
import { useAuth } from './AuthContext';

interface GlobalNotificationContextType {
  notifications: GlobalNotification[];
  unreadCount: number;
  markAllAsRead: () => void;
}

const GlobalNotificationContext = createContext<GlobalNotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAllAsRead: () => {},
});

export const useGlobalNotification = () => useContext(GlobalNotificationContext);

const STORAGE_KEY_LAST_READ = 'mobi_trash_notif_last_read';

export const GlobalNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    // Local state to store results from multiple listeners
    let publicNotifs: GlobalNotification[] = [];
    let privateNotifs: GlobalNotification[] = [];

    const updateState = () => {
        const merged = [...publicNotifs, ...privateNotifs].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setNotifications(merged);

        const lastRead = window.localStorage.getItem(STORAGE_KEY_LAST_READ);
        const lastReadTime = lastRead ? new Date(lastRead).getTime() : 0;
        
        const count = merged.filter(n => new Date(n.createdAt).getTime() > lastReadTime).length;
        setUnreadCount(count);
    };

    // Listener 1: Public Notifications (targetEmail == null)
    // Note: We remove orderBy here to avoid composite index requirements with 'where' clause
    // since we do client-side sorting anyway for the merged list.
    const unsubscribePublic = db.collection('globalNotifications')
      .where('targetEmail', '==', null)
      .limit(20)
      .onSnapshot((snapshot) => {
        publicNotifs = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                message: data.message,
                link: data.link,
                imageUrl: data.imageUrl,
                createdAt: data.createdAt,
                targetEmail: null
            };
        });
        updateState();
      }, (error) => {
        console.error("Error listening to public notifications:", error);
      });

    // Listener 2: Private Notifications (targetEmail == user.email)
    let unsubscribePrivate = () => {};
    
    if (user?.email) {
         unsubscribePrivate = db.collection('globalNotifications')
            .where('targetEmail', '==', user.email)
            .limit(20)
            .onSnapshot((snapshot) => {
                privateNotifs = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title,
                        message: data.message,
                        link: data.link,
                        imageUrl: data.imageUrl,
                        createdAt: data.createdAt,
                        targetEmail: data.targetEmail
                    };
                });
                updateState();
            }, (error) => {
                 console.error("Error listening to private notifications:", error);
            });
    }

    return () => {
        unsubscribePublic();
        unsubscribePrivate();
    };
  }, [user]);

  const markAllAsRead = () => {
    const now = new Date().toISOString();
    window.localStorage.setItem(STORAGE_KEY_LAST_READ, now);
    setUnreadCount(0);
  };

  return (
    <GlobalNotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead }}>
      {children}
    </GlobalNotificationContext.Provider>
  );
};
