
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { loadGoogleDriveApi, authenticateWithGoogleDrive, isAuthenticated } from "@/services/googleDriveService";
import { GoogleIcon } from "./GoogleIcon";

interface GoogleDriveAuthButtonProps {
  onAuthSuccess?: () => void;
}

export const GoogleDriveAuthButton: React.FC<GoogleDriveAuthButtonProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // Initialize Google Drive API
  useEffect(() => {
    const initGoogleDrive = async () => {
      try {
        await loadGoogleDriveApi();
        setAuthenticated(isAuthenticated());
      } catch (error) {
        console.error("Failed to initialize Google Drive:", error);
      }
    };
    
    initGoogleDrive();
  }, []);

  const handleAuth = async () => {
    setLoading(true);
    try {
      await authenticateWithGoogleDrive();
      setAuthenticated(true);
      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (error) {
      console.error("Authentication failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authenticated) {
    return (
      <Button variant="outline" disabled className="bg-green-50">
        <GoogleIcon className="mr-2 h-4 w-4" />
        Connected to Google Drive
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={handleAuth} disabled={loading}>
      <GoogleIcon className="mr-2 h-4 w-4" />
      {loading ? "Connecting..." : "Connect Google Drive"}
    </Button>
  );
};
