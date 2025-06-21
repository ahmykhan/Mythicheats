
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

  const gridElements = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: i * 0.1
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOn"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.3"
              />
            </pattern>
            <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
              <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating Geometric Shapes */}
      {floatingElements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            scale: element.scale,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            delay: element.delay,
            ease: "easeInOut",
          }}
        >
          {element.id % 3 === 0 ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-sm" />
          ) : element.id % 3 === 1 ? (
            <div className="w-6 h-6 rotate-45 bg-gradient-to-r from-secondary/40 to-primary/40 blur-sm" />
          ) : (
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-accent/40 blur-sm" />
          )}
        </motion.div>
      ))}

      {/* Theme-specific animated backgrounds */}
      {theme === 'dark' && (
        <>
          {/* Cosmic Particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 50 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
          
          {/* Nebula Effect */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          </div>
        </>
      )}

      {theme === 'pink' && (
        <>
          {/* Floating Hearts */}
          <div className="absolute inset-0">
            {Array.from({ length: 15 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -50, 0],
                  rotate: [0, 360],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              >
                <div className="w-4 h-4 bg-pink-400/40 rounded-full relative">
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-pink-400/40 rounded-full" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400/40 rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Cherry Blossom Petals */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-pink-300/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${-10 + Math.random() * 20}%`,
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, Math.random() * 50 - 25],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 15 + Math.random() * 10,
                  repeat: Infinity,
                  delay: Math.random() * 10,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        </>
      )}

      {theme === 'purple' && (
        <>
          {/* Magic Sparkles */}
          <div className="absolute inset-0">
            {Array.from({ length: 30 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              >
                <div className="w-2 h-2 bg-yellow-400/60 rounded-full relative">
                  <div className="absolute inset-0 bg-yellow-400/60 rounded-full animate-ping" />
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Mystical Orbs */}
          <div className="absolute inset-0 opacity-40">
            <motion.div
              className="absolute top-1/6 right-1/5 w-32 h-32 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute bottom-1/5 left-1/6 w-24 h-24 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 rounded-full blur-xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: 1,
              }}
            />
          </div>
        </>
      )}

      {theme === 'light' && (
        <>
          {/* Floating Bubbles */}
          <div className="absolute inset-0">
            {Array.from({ length: 12 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-primary/20 bg-white/10"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${100 + Math.random() * 20}%`,
                  width: `${20 + Math.random() * 30}px`,
                  height: `${20 + Math.random() * 30}px`,
                }}
                animate={{
                  y: [0, -window.innerHeight - 100],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 10 + Math.random() * 5,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear",
                }}
              />
            ))}
          </div>
          
          {/* Sunbeam Effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-yellow-200/40 via-transparent to-transparent transform rotate-12" />
            <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-orange-200/40 via-transparent to-transparent transform -rotate-12" />
            <div className="absolute top-0 left-2/3 w-1 h-full bg-gradient-to-b from-yellow-300/40 via-transparent to-transparent transform rotate-6" />
          </div>
        </>
      )}

      {/* Interactive Grid Lines */}
      <div className="absolute inset-0 opacity-10">
        {gridElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute bg-primary/20"
            style={{
              left: `${(element.id % 5) * 25}%`,
              top: `${Math.floor(element.id / 5) * 25}%`,
              width: '1px',
              height: '25%',
            }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              scaleY: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: element.delay,
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/5 to-background/20" />
    </div>
  );
};

export default EnhancedBackground;
