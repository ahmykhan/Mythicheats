
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { GoogleIcon } from "./GoogleIcon";
import { ExternalLink } from "lucide-react";

interface GoogleDriveAuthButtonProps {
  onAuthSuccess?: () => void;
}

export const GoogleDriveAuthButton: React.FC<GoogleDriveAuthButtonProps> = ({ onAuthSuccess }) => {
  // Open Google Drive in a new tab
  const openDriveLink = () => {
    window.open("https://drive.google.com/drive/folders/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e", "_blank");
  };

  return (
    <Button 
      variant="outline" 
      onClick={openDriveLink} 
      className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
    >
      <ExternalLink className="mr-2 h-4 w-4 text-amber-600" />
      <span className="hidden sm:inline">View in Google Drive</span>
      <span className="sm:hidden">Drive</span>
    </Button>
  );
};
