
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ALLOWED_DOMAIN = "@lhr.nu.edu.pk";
import AuthPage from "./auth/AuthPage";
import MainDashboard from "./MainDashboard";
import UsernameSetup from "./auth/UsernameSetup";

const PWAApp: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    registerServiceWorker();
    requestNotificationPermission();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const email = session.user.email || "";
          if (!email.endsWith(ALLOWED_DOMAIN)) {
            await supabase.auth.signOut();
            setUser(null);
            setUsername("");
            setNeedsUsername(false);
            toast({
              title: "Access Denied",
              description: "Access restricted to university student emails only (@lhr.nu.edu.pk).",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
          setUser(session.user);
          await checkUsername(session.user.id);
        } else {
          setUser(null);
          setUsername("");
          setNeedsUsername(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const email = user.email || "";
        if (!email.endsWith(ALLOWED_DOMAIN)) {
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "Access restricted to university student emails only (@lhr.nu.edu.pk).",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        setUser(user);
        await checkUsername(user.id);
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUsername = async (userId: string) => {
    try {
      const { data: usernameData } = await supabase
        .from("usernames")
        .select("username")
        .eq("user_id", userId)
        .single();

      if (usernameData?.username) {
        setUsername(usernameData.username);
        setNeedsUsername(false);
      } else {
        setNeedsUsername(true);
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setNeedsUsername(true);
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
    setNeedsUsername(false);
    toast({
      title: "Welcome!",
      description: `Logged in as ${username}`
    });
  };

  const handleUsernameSet = (username: string) => {
    setUsername(username);
    setNeedsUsername(false);
    toast({
      title: "Username set successfully!",
      description: `Welcome, ${username}!`
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUsername("");
      setNeedsUsername(false);
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

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (needsUsername) {
    return (
      <UsernameSetup 
        onUsernameSet={handleUsernameSet}
        userEmail={user.email}
      />
    );
  }

  return (
    <MainDashboard
      username={username}
      userEmail={user.email}
      onLogout={handleLogout}
    />
  );
};

export default PWAApp;
