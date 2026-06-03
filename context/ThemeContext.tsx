import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resolvedTheme: 'light' | 'dark';
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => { },
  toggleTheme: () => { },
  resolvedTheme: 'light',
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      if (storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'system') {
        return storedTheme;
      }
      return 'light';
    }
    return 'light';
  });


  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const handleThemeChange = () => {
      const root = window.document.documentElement;
      const body = window.document.body;
      let effectiveTheme: 'light' | 'dark' = 'light';

      if (theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        effectiveTheme = theme as 'light' | 'dark';
      }

      setResolvedTheme(effectiveTheme);

      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
        body.classList.add('light-mode');
        body.classList.remove('dark-mode');
      }
    };

    handleThemeChange();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prevTheme => {
      const isDark = prevTheme === 'dark' || (prevTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const newTheme = isDark ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };


  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

