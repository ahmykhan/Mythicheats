import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const EnhancedBackground = () => {
  const { theme } = useTheme();

  const floatingElements = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    scale: 0.3 + Math.random() * 0.7,
    duration: 15 + Math.random() * 10,
    delay: Math.random() * 5
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating Geometric Shapes */}
      {floatingElements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute"
          style={{ left: `${element.x}%`, top: `${element.y}%`, scale: element.scale }}
          animate={{ y: [0, -30, 0], x: [0, 15, 0], rotate: [0, 180, 360], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: element.duration, repeat: Infinity, delay: element.delay, ease: "easeInOut" }}
        >
          {element.id % 3 === 0 ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-sm" />
          ) : element.id % 3 === 1 ? (
            <div className="w-6 h-6 rotate-45 bg-gradient-to-r from-secondary/40 to-primary/40 blur-sm" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-accent/30 blur-sm" />
          )}
        </motion.div>
      ))}

      {/* Dark theme: stars */}
      {theme === 'dark' && (
        <div className="absolute inset-0">
          {Array.from({ length: 40 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-foreground rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
            />
          ))}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      )}

      {/* Midnight theme: purple orbs */}
      {theme === 'midnight' && (
        <div className="absolute inset-0">
          {Array.from({ length: 25 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ scale: [0, 1, 0], rotate: [0, 180, 360], opacity: [0, 0.8, 0] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 5 }}
            >
              <div className="w-2 h-2 bg-primary/50 rounded-full" />
            </motion.div>
          ))}
          <div className="absolute inset-0 opacity-40">
            <motion.div
              className="absolute top-1/4 right-1/4 w-40 h-40 bg-primary/20 rounded-full blur-2xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-primary/15 rounded-full blur-2xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
          </div>
        </div>
      )}

      {/* Light theme: bubbles */}
      {theme === 'light' && (
        <div className="absolute inset-0">
          {Array.from({ length: 10 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-primary/15 bg-primary/5"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${100 + Math.random() * 20}%`,
                width: `${20 + Math.random() * 30}px`,
                height: `${20 + Math.random() * 30}px`,
              }}
              animate={{ y: [0, -window.innerHeight - 100], opacity: [0, 0.5, 0] }}
              transition={{ duration: 10 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
            />
          ))}
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/5 to-background/20" />
    </div>
  );
};

export default EnhancedBackground;
