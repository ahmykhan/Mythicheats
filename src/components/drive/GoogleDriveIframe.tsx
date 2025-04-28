
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

  useEffect(() => {
    // Reset iframe load state when theme changes to trigger reload animation
    setIframeLoaded(false);
    
    // Give time for the iframe to reset
    const timer = setTimeout(() => {
      const iframe = document.querySelector('.drive-iframe') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = iframe.src;
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [theme]);

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
        className="relative z-10 themed-iframe-container"
      >
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
            className={`drive-iframe rounded-xl transition-all duration-500 ${theme}-iframe ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundColor: `var(--iframe-bg, rgba(255, 255, 255, 0.1))`,
              border: `1px solid var(--iframe-border, rgba(255, 255, 255, 0.1))`,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
            }}
            onLoad={() => {
              // Small delay to ensure styles are applied
              setTimeout(() => setIframeLoaded(true), 300);
            }}
            allowFullScreen
            title="Google Drive Folder"
          ></iframe>
          
          {/* Add a themed overlay to the iframe to ensure consistent styling */}
          <div 
            className={`absolute inset-0 pointer-events-none ${theme}-iframe-overlay rounded-xl transition-all duration-500 opacity-20`}
          ></div>
        </div>
      </motion.div>
    </div>
  );
};

export default GoogleDriveIframe;
