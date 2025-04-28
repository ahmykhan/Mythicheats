
import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeType = 'dark' | 'light' | 'pink' | 'purple';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    // Check if theme is saved in localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    return savedTheme || 'dark';
  });
  
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Function to apply theme
    const applyTheme = (newTheme: ThemeType) => {
      // Indicate we're starting a transition
      setIsTransitioning(true);
      
      // Remove all previous theme classes
      document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-pink', 'theme-purple');
      
      // Add current theme class
      document.documentElement.classList.add(`theme-${newTheme}`);
      
      // Save to localStorage
      localStorage.setItem('theme', newTheme);
      
      // Apply theme to body to ensure full-page coloring
      document.body.setAttribute('data-theme', newTheme);
      
      // End transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    };

    // Apply theme immediately to prevent flash of wrong theme
    applyTheme(theme);
  }, [theme]);

  const handleSetTheme = (newTheme: ThemeType) => {
    // Only allow theme change if not currently transitioning
    if (!isTransitioning) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
