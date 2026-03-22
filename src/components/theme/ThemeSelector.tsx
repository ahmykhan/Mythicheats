
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Flower, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme, isTransitioning } = useTheme();
  const { toast } = useToast();
  
  const handleThemeChange = (newTheme: 'dark' | 'light' | 'pink' | 'purple') => {
    setTheme(newTheme);
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated`,
      description: "Your new theme has been applied to the entire site.",
      duration: 2000,
    });
  };
  
  const getThemeIcon = () => {
    switch(theme) {
      case 'dark': return <Moon className="w-5 h-5 text-blue-300" />;
      case 'light': return <Sun className="w-5 h-5 text-yellow-400" />;
      case 'pink': return <Flower className="w-5 h-5 text-pink-400" />;
      case 'purple': return <Sparkles className="w-5 h-5 text-purple-400" />;
      default: return <Moon className="w-5 h-5 text-blue-300" />;
    }
  };

  const buttonVariants = {
    hover: { scale: 1.1, rotate: [0, 5, 0] },
    tap: { scale: 0.95 }
  };
  
  return (
    <div className="relative inline-block">
      <Popover>
        <PopoverTrigger asChild>
          <motion.button
            id="theme-selector-button"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="p-3 rounded-full backdrop-blur-lg glass-button shadow-lg"
            aria-label="Change theme"
            disabled={isTransitioning}
          >
            {getThemeIcon()}
            {isTransitioning && (
              <span className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="w-full h-full rounded-full"
                  animate={{ 
                    boxShadow: ['0 0 0 0 rgba(255,255,255,0)', '0 0 0 10px rgba(255,255,255,0)'],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 1, repeat: 0 }}
                />
              </span>
            )}
          </motion.button>
        </PopoverTrigger>
        
        <PopoverContent side="bottom" align="end" className="w-56 p-3 glass-card border-none shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={theme === 'dark' ? "default" : "outline"}
              size="lg"
              onClick={() => handleThemeChange('dark')}
              className={`flex items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'bg-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              disabled={isTransitioning}
            >
              <Moon className="w-5 h-5 text-blue-300" />
              <span>Dark</span>
            </Button>
            
            <Button
              variant={theme === 'light' ? "default" : "outline"}
              size="lg"
              onClick={() => handleThemeChange('light')}
              className={`flex items-center justify-center gap-2 transition-all ${theme === 'light' ? 'bg-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              disabled={isTransitioning}
            >
              <Sun className="w-5 h-5 text-yellow-400" />
              <span>Light</span>
            </Button>
            
            <Button
              variant={theme === 'pink' ? "default" : "outline"}
              size="lg"
              onClick={() => handleThemeChange('pink')}
              className={`flex items-center justify-center gap-2 transition-all ${theme === 'pink' ? 'bg-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              disabled={isTransitioning}
            >
              <Flower className="w-5 h-5 text-pink-400" />
              <span>Spring</span>
            </Button>
            
            <Button
              variant={theme === 'purple' ? "default" : "outline"}
              size="lg"
              onClick={() => handleThemeChange('purple')}
              className={`flex items-center justify-center gap-2 transition-all ${theme === 'purple' ? 'bg-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              disabled={isTransitioning}
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Cute</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ThemeSelector;
