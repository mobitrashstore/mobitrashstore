
import React, { createContext, useState, useContext, ReactNode, FC } from 'react';
import { useAuth } from './AuthContext';

interface VisualEditingContextType {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  toggleEditing: () => void;
  canEdit: boolean;
  draggedWidget: string | null;
  setDraggedWidget: (value: string | null) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  fullWidth: boolean;
  setFullWidth: (value: boolean) => void;
}

const VisualEditingContext = createContext<VisualEditingContextType>({
  isEditing: false,
  setIsEditing: () => { },
  toggleEditing: () => { },
  canEdit: false,
  draggedWidget: null,
  setDraggedWidget: () => { },
  primaryColor: '#831843',
  setPrimaryColor: () => { },
  fullWidth: false,
  setFullWidth: () => { },
});

export const useVisualEditing = () => useContext(VisualEditingContext);

export const VisualEditingProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#831843');
  const [fullWidth, setFullWidth] = useState(false);

  const canEdit = user?.role === 'admin';

  // If user logs out or role changes, disable editing
  React.useEffect(() => {
    if (!canEdit) {
      setIsEditing(false);
    }
  }, [canEdit]);

  // Disable editing on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsEditing(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleEditing = () => {
    if (window.innerWidth < 768) {
      alert("Visual Editing is only available on Desktop.");
      return;
    }

    if (canEdit) {
      if (!isEditing) {
        const password = prompt("Enter Administration Password to Enable Visual Edit:");
        if (password === "9827801575") {
          setIsEditing(true);
        } else if (password !== null) {
          alert("Incorrect password. Access denied.");
        }
      } else {
        setIsEditing(false);
      }
    }
  };

  // Apply primary color to CSS variable
  React.useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    // Also generate a lighter/darker version if needed, or just use opacity in tailwind
  }, [primaryColor]);

  return (
    <VisualEditingContext.Provider value={{
      isEditing,
      setIsEditing,
      toggleEditing,
      canEdit,
      draggedWidget,
      setDraggedWidget,
      primaryColor,
      setPrimaryColor,
      fullWidth,
      setFullWidth
    }}>
      {children}
    </VisualEditingContext.Provider>
  );
};
