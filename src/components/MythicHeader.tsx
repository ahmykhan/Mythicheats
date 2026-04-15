import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const MythicHeader = () => {
  const { theme } = useTheme();

  const getTextGradient = () => {
    switch(theme) {
      case 'dark':
        return 'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500';
      case 'midnight':
        return 'bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400';
      default:
        return 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 200 } },
    hidden: { opacity: 0, y: 20, transition: { type: "spring", damping: 12, stiffness: 200 } },
  };

  const fireEmojis = ['🔥', '✨', '💥'];
  
  return (
    <div className="w-full flex flex-col items-center justify-center pt-8 pb-4">
      <motion.div className="relative" initial="hidden" animate="visible" variants={container}>
        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight text-center ${getTextGradient()} bg-clip-text text-transparent`}>
          {'Ultimate Mythic Cheats'.split('').map((letter, index) => (
            <motion.span key={index} variants={child} className="inline-block">
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
          ))}
        </h1>
        
        <div className="absolute -top-8 left-0 right-0 flex justify-center">
          {fireEmojis.map((emoji, index) => (
            <motion.span
              key={index}
              className="text-3xl mx-1"
              initial={{ y: 10, opacity: 0.7 }}
              animate={{ y: [-5, -15, -5], opacity: [0.7, 1, 0.7], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3, ease: "easeInOut" }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MythicHeader;
