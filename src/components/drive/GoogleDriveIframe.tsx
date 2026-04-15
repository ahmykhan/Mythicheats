import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface GoogleDriveIframeProps {
  folderId: string;
}

const GoogleDriveIframe: React.FC<GoogleDriveIframeProps> = ({ folderId }) => {
  const { theme } = useTheme();
  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <div className="relative w-full mt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 p-6 rounded-2xl bg-card border border-border"
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
            className={`rounded-xl transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            onLoad={() => setTimeout(() => setIframeLoaded(true), 300)}
            allowFullScreen
            title="Google Drive Folder"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default GoogleDriveIframe;
