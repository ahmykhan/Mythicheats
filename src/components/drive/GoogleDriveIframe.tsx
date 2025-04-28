
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface GoogleDriveIframeProps {
  folderId: string;
}

const GoogleDriveIframe: React.FC<GoogleDriveIframeProps> = ({ folderId }) => {
  const { theme } = useTheme();
  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
  const [iframeLoaded, setIframeLoaded] = useState(false);

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
        <div className={`p-8 rounded-2xl shadow-lg transition-all duration-500 ease-in-out glass-card ${
          theme === 'dark' ? 'bg-opacity-70' : 
          theme === 'light' ? 'bg-opacity-90' : 
          'bg-opacity-80'
        }`}>
          <div className="relative">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
            <iframe 
              src={embedUrl}
              width="100%"
              height="600"
              style={{ 
                border: 0,
                opacity: iframeLoaded ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out'
              }}
              onLoad={() => setIframeLoaded(true)}
              allowFullScreen
              className={`rounded-xl transition-all duration-500 ${theme}-iframe`}
              title="Google Drive Folder"
            ></iframe>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GoogleDriveIframe;
