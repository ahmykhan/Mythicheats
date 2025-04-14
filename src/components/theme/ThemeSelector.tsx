
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Flower, Sparkles } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 right-4 z-50"
    >
      <HoverCard>
        <HoverCardTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg"
          >
            {theme === 'dark' && <Moon className="w-5 h-5 text-blue-300" />}
            {theme === 'light' && <Sun className="w-5 h-5 text-yellow-400" />}
            {theme === 'pink' && <Flower className="w-5 h-5 text-pink-400" />}
            {theme === 'purple' && <Sparkles className="w-5 h-5 text-purple-400" />}
          </motion.button>
        </HoverCardTrigger>
        <HoverCardContent side="bottom" className="p-2 backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg">
          <ToggleGroup type="single" value={theme} onValueChange={(value) => value && setTheme(value as any)}>
            <ToggleGroupItem value="dark" aria-label="Dark Mode">
              <Moon className="w-5 h-5 text-blue-300 mr-2" />
              <span>Dark</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="light" aria-label="Light Mode">
              <Sun className="w-5 h-5 text-yellow-400 mr-2" />
              <span>Light</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="pink" aria-label="Pink Mode">
              <Flower className="w-5 h-5 text-pink-400 mr-2" />
              <span>Spring</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="purple" aria-label="Purple Mode">
              <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
              <span>Cute</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </HoverCardContent>
      </HoverCard>
    </motion.div>
  );
};

export default ThemeSelector;
