
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { loadGoogleDriveApi, authenticateWithGoogleDrive, isAuthenticated, isUsingFallbackData } from "@/services/googleDriveService";
import { GoogleIcon } from "./GoogleIcon";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface GoogleDriveAuthButtonProps {
  onAuthSuccess?: () => void;
}

export const GoogleDriveAuthButton: React.FC<GoogleDriveAuthButtonProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  // Initialize Google Drive API
  useEffect(() => {
    const initGoogleDrive = async () => {
      try {
        await loadGoogleDriveApi();
        setAuthenticated(isAuthenticated());
        setUsingFallback(isUsingFallbackData());
      } catch (error) {
        console.error("Failed to initialize Google Drive:", error);
        setUsingFallback(true);
      }
    };
    
    initGoogleDrive();
  }, []);

  const handleAuth = async () => {
    setLoading(true);
    try {
      await authenticateWithGoogleDrive();
      setAuthenticated(isAuthenticated());
      setUsingFallback(isUsingFallbackData());
      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  if (authenticated) {
    return (
      <Button variant="outline" disabled className="bg-green-50 border-green-200 text-green-800">
        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
        <span className="hidden sm:inline">Connected to Drive</span>
        <span className="sm:hidden">Connected</span>
      </Button>
    );
  }

  if (usingFallback) {
    return (
      <Button variant="outline" className="bg-amber-50 border-amber-200 text-amber-800">
        <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
        <span className="hidden sm:inline">Demo Mode</span>
        <span className="sm:hidden">Demo</span>
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={handleAuth} disabled={loading}>
      <GoogleIcon className="mr-2 h-4 w-4" />
      {loading ? "Connecting..." : (
        <>
          <span className="hidden sm:inline">Connect Drive</span>
          <span className="sm:hidden">Connect</span>
        </>
      )}
    </Button>
  );
};
