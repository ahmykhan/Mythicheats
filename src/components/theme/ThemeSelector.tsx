import React from 'react';
import { useTheme, ThemeType } from '@/context/ThemeContext';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const themes: { key: ThemeType; label: string; icon: React.ReactNode }[] = [
  { key: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  { key: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  { key: 'midnight', label: 'Midnight', icon: <Sparkles className="w-4 h-4" /> },
];

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleThemeChange = (t: ThemeType) => {
    setTheme(t);
    toast({ title: `${t.charAt(0).toUpperCase() + t.slice(1)} theme activated`, duration: 1500 });
  };

  const currentIcon = themes.find((t) => t.key === theme)?.icon ?? <Moon className="w-4 h-4" />;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full" aria-label="Change theme">
          {currentIcon}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-40 p-2">
        <div className="flex flex-col gap-1">
          {themes.map((t) => (
            <Button
              key={t.key}
              variant={theme === t.key ? 'default' : 'ghost'}
              size="sm"
              className="justify-start gap-2"
              onClick={() => handleThemeChange(t.key)}
            >
              {t.icon}
              {t.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeSelector;
