
import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeType = 'dark' | 'light' | 'pink' | 'purple';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
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
      
      // End transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    };

    // Apply theme with a small delay to ensure smooth transitions
    const timeoutId = setTimeout(() => {
      applyTheme(theme);
    }, 10);

    return () => clearTimeout(timeoutId);
  }, [theme]);

  const handleSetTheme = (newTheme: ThemeType) => {
    // Only allow theme change if not currently transitioning
    if (!isTransitioning) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
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
