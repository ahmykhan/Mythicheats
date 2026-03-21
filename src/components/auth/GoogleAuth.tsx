
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { motion } from "framer-motion";
import UsernameSetup from "./UsernameSetup";

interface GoogleAuthProps {
  onAuthSuccess: (user: any, username: string) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [needsUsername, setNeedsUsername] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Check if user has username
        const { data: usernameData } = await supabase
          .from("usernames")
          .select("username")
          .eq("user_id", user.id)
          .single();

        if (usernameData?.username) {
          onAuthSuccess(user, usernameData.username);
        } else {
          setNeedsUsername(true);
        }
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin
      });

      if (result.error) throw result.error;
    } catch (error) {
      console.error("Error with Google login:", error);
      toast({
        title: "Login Error",
        description: "Failed to login with Google. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSet = (username: string) => {
    setNeedsUsername(false);
    onAuthSuccess(user, username);
  };

  if (needsUsername && user) {
    return (
      <UsernameSetup 
        onUsernameSet={handleUsernameSet}
        userEmail={user.email}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md p-8 glass-card text-center">
          <h1 className="text-3xl font-bold mb-2">StudyHub</h1>
          <p className="text-gray-600 mb-8">Past Papers & Notes Platform</p>
          
          <Button 
            onClick={handleGoogleLogin}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? "Signing in..." : "Sign in with Google"}
          </Button>
          
          <p className="text-xs text-gray-500 mt-4">
            Sign in to access past papers, notes, and chat with fellow students
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default GoogleAuth;
