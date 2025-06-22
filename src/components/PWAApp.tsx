
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import GoogleAuth from "./auth/GoogleAuth";
import AppLayout from "./layout/AppLayout";
import ContentViewer from "./content/ContentViewer";
import ChatRoom from "./chat/ChatRoom";

const PWAApp: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<'home' | 'chat'>('home');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    registerServiceWorker();
    requestNotificationPermission();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: usernameData } = await supabase
          .from("usernames")
          .select("username")
          .eq("user_id", user.id)
          .single();

        if (usernameData?.username) {
          setUser(user);
          setUsername(usernameData.username);
        }
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleAuthSuccess = (user: any, username: string) => {
    setUser(user);
    setUsername(username);
    toast({
      title: "Welcome!",
      description: `Logged in as ${username}`
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUsername("");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !username) {
    return <GoogleAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <AppLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={handleLogout}
      username={username}
    >
      {currentPage === 'home' && <ContentViewer />}
      {currentPage === 'chat' && <ChatRoom currentUsername={username} />}
    </AppLayout>
  );
};

export default PWAApp;
