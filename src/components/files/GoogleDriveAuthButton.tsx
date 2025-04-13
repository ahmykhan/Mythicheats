
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { loadGoogleDriveApi, isUsingFallbackData } from "@/services/googleDriveService";
import { GoogleIcon } from "./GoogleIcon";
import { AlertTriangle, ExternalLink } from "lucide-react";

interface GoogleDriveAuthButtonProps {
  onAuthSuccess?: () => void;
}

export const GoogleDriveAuthButton: React.FC<GoogleDriveAuthButtonProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [usingDirectLinks, setUsingDirectLinks] = useState(true);

  // Initialize Google Drive API - simplified
  useEffect(() => {
    const initGoogleDrive = async () => {
      try {
        await loadGoogleDriveApi();
        setUsingDirectLinks(isUsingFallbackData());
      } catch (error) {
        console.error("Failed to initialize Google Drive:", error);
        setUsingDirectLinks(true);
      }
    };
    
    initGoogleDrive();
  }, []);

  // Open Google Drive in a new tab
  const openDriveLink = () => {
    window.open("https://drive.google.com/drive/folders/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e", "_blank");
  };

  return (
    <Button variant="outline" onClick={openDriveLink} className="bg-amber-50 border-amber-200 text-amber-800">
      <ExternalLink className="mr-2 h-4 w-4 text-amber-600" />
      <span className="hidden sm:inline">Open in Google Drive</span>
      <span className="sm:hidden">Drive</span>
    </Button>
  );
};
