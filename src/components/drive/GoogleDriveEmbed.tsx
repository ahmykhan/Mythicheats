
import React from "react";

interface GoogleDriveEmbedProps {
  folderId: string;
  title?: string;
  height?: number;
}

const GoogleDriveEmbed: React.FC<GoogleDriveEmbedProps> = ({ 
  folderId, 
  title = "Google Drive Files", 
  height = 600 
}) => {
  // Convert standard Google Drive link to embed URL format
  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;

  return (
    <div className="google-drive-container">
      <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
      <div className="iframe-container border border-gray-200 rounded-md overflow-hidden">
        <iframe 
          src={embedUrl}
          width="100%" 
          height={height} 
          frameBorder="0"
          title="Google Drive Folder" 
          className="w-full"
        ></iframe>
      </div>
    </div>
  );
};

export default GoogleDriveEmbed;
