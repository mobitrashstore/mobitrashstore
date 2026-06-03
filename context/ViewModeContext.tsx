
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface ViewModeContextType {
  isDesktopView: boolean;
  toggleDesktopView: () => void;
}

const ViewModeContext = createContext<ViewModeContextType>({
  isDesktopView: false,
  toggleDesktopView: () => {},
});

export const useViewMode = () => useContext(ViewModeContext);

export const ViewModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDesktopView, setIsDesktopView] = useState(false);

  useEffect(() => {
    const metaViewport = document.querySelector('meta[name="viewport"]');
    
    if (isDesktopView) {
      // Force Desktop Width (1280px) and allow zooming
      if (metaViewport) {
        metaViewport.setAttribute('content', 'width=1280, initial-scale=0.1, user-scalable=yes');
      }
      // Add a class to body to help specific CSS overrides if needed
      document.body.classList.add('force-desktop');
    } else {
      // Revert to Standard Mobile View
      if (metaViewport) {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
      document.body.classList.remove('force-desktop');
    }
  }, [isDesktopView]);

  const toggleDesktopView = () => {
    setIsDesktopView(prev => !prev);
  };

  return (
    <ViewModeContext.Provider value={{ isDesktopView, toggleDesktopView }}>
      {children}
    </ViewModeContext.Provider>
  );
};
