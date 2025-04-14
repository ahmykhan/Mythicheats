
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const MythicHeader = () => {
  const { theme } = useTheme();

  // Determine text gradient based on theme
  const getTextGradient = () => {
    switch(theme) {
      case 'dark':
        return 'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500';
      case 'light':
        return 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600';
      case 'pink':
        return 'bg-gradient-to-r from-red-400 via-pink-500 to-rose-500';
      case 'purple':
        return 'bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500';
      default:
        return 'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500';
    }
  };

  // Animation for letters
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  // Fire animation (emojis)
  const fireEmojis = ['🔥', '✨', '💥'];
  
  return (
    <div className="w-full flex flex-col items-center justify-center pt-8 pb-4">
      <motion.div
        className="relative"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight text-center ${getTextGradient()} bg-clip-text text-transparent`}>
          {'Ultimate Mythic Cheats'.split('').map((letter, index) => (
            <motion.span key={index} variants={child} className="inline-block">
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
          ))}
        </h1>
        
        {/* Fire animation - enhanced for purple theme */}
        <div className={`absolute -top-8 left-0 right-0 flex justify-center ${theme === 'purple' ? 'scale-125' : ''}`}>
          {fireEmojis.map((emoji, index) => (
            <motion.span
              key={index}
              className="text-3xl mx-1"
              initial={{ y: 10, opacity: 0.7 }}
              animate={{ 
                y: [-5, -15, -5], 
                opacity: [0.7, 1, 0.7],
                scale: theme === 'purple' ? [1, 1.4, 1] : [1, 1.2, 1],
              }}
              transition={{ 
                duration: theme === 'purple' ? 1.5 : 2, 
                repeat: Infinity, 
                delay: index * 0.3,
                ease: "easeInOut"
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
        
        {/* Extra fire particles for purple theme */}
        {theme === 'purple' && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  x: (i % 2 === 0 ? -1 : 1) * Math.random() * 40,
                  y: 20,
                  opacity: 0
                }}
                animate={{ 
                  y: [20, -60 - Math.random() * 40],
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1 + Math.random() * 0.5, 0.2],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              >
                <div className="h-2 w-2 bg-orange-500 rounded-full filter blur-sm"></div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MythicHeader;
