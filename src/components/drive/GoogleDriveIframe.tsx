
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface GoogleDriveIframeProps {
  folderId: string;
}

const GoogleDriveIframe: React.FC<GoogleDriveIframeProps> = ({ folderId }) => {
  const { theme } = useTheme();
  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Theme-specific decorative elements
  const renderThemeDecorations = () => {
    switch(theme) {
      case 'pink':
        return (
          <>
            <motion.div 
              className="absolute top-[-20px] left-[10%] z-0"
              animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-4xl">🌸</span>
            </motion.div>
            <motion.div 
              className="absolute top-[20px] right-[15%] z-0"
              animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <span className="text-4xl">🌷</span>
            </motion.div>
            <motion.div 
              className="absolute bottom-[20px] right-[10%] z-0"
              animate={{ y: [0, -5, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <span className="text-4xl">🌿</span>
            </motion.div>
          </>
        );
      case 'purple':
        return (
          <>
            <motion.div 
              className="absolute top-[-15px] left-[20%] z-0"
              animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-4xl">💜</span>
            </motion.div>
            <motion.div 
              className="absolute top-[30px] right-[20%] z-0"
              animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
            >
              <span className="text-4xl">🔮</span>
            </motion.div>
            <motion.div 
              className="absolute bottom-[30px] left-[15%] z-0"
              animate={{ y: [0, -6, 0], rotate: [0, 4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            >
              <span className="text-4xl">✨</span>
            </motion.div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full mt-8">
      {renderThemeDecorations()}
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        <div className={`p-4 rounded-xl backdrop-blur-md ${
          theme === 'dark' ? 'bg-gray-800/40 border border-gray-700' : 
          theme === 'light' ? 'bg-white/70 border border-gray-200' : 
          theme === 'pink' ? 'bg-pink-50/70 border border-pink-200' : 
          'bg-purple-50/70 border border-purple-200'
        }`}>
          <iframe 
            src={embedUrl}
            width="100%"
            height="600"
            style={{ border: 0 }}
            allowFullScreen
            className="rounded-lg"
            title="Google Drive Folder"
          ></iframe>
        </div>
      </motion.div>
    </div>
  );
};

export default GoogleDriveIframe;
