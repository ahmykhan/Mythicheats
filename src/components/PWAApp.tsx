
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ALLOWED_DOMAIN = "@lhr.nu.edu.pk";
const ADMIN_EMAIL = "furyboy4592@gmail.com";

import AuthPage from "./auth/AuthPage";
import MainDashboard from "./MainDashboard";
import UsernameSetup from "./auth/UsernameSetup";

const isAllowedEmail = (email: string) => {
  return email.endsWith(ALLOWED_DOMAIN) || email === ADMIN_EMAIL;
};

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const email = session.user.email || "";
          if (!isAllowedEmail(email)) {
            // Use setTimeout to avoid deadlock in auth listener
            setTimeout(async () => {
              await supabase.auth.signOut();
              setUser(null);
              setUsername("");
              setNeedsUsername(false);
              toast({
                title: "Access Denied",
                description: "Access restricted to lhr.nu.edu.pk accounts only.",
                variant: "destructive"
              });
            }, 0);
            setLoading(false);
            return;
          }
          setUser(session.user);
          // Auto-create username from Google metadata on first login
          setTimeout(() => checkAndSetUsername(session.user), 0);
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
        if (!isAllowedEmail(email)) {
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "Access restricted to lhr.nu.edu.pk accounts only.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        setUser(user);
        await checkAndSetUsername(user);
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseRollNumber = (email: string): string | null => {
    // e.g. l242541@lhr.nu.edu.pk → 24L-2541
    const prefix = email.split("@")[0]; // "l242541"
    if (!prefix || prefix.length < 4) return null;
    const digits = prefix.substring(1); // "242541"
    const batch = digits.substring(0, 2); // "24"
    const number = digits.substring(2); // "2541"
    return `${batch}L-${number}`;
  };

  const checkAndSetUsername = async (user: any) => {
    try {
      const { data: usernameData, error } = await supabase
        .from("usernames")
        .select("username")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking username:", error);
        setNeedsUsername(true);
        return;
      }

      if (usernameData?.username) {
        setUsername(usernameData.username);
        setNeedsUsername(false);
      } else {
        // Auto-generate username: "Full Name (RollNumber)"
        const googleName = user.user_metadata?.full_name || user.user_metadata?.name;
        const email = user.email || "";
        const rollNumber = email.endsWith(ALLOWED_DOMAIN) ? parseRollNumber(email) : null;

        let autoUsername = "";
        if (googleName && rollNumber) {
          autoUsername = `${googleName} (${rollNumber})`;
        } else if (googleName) {
          autoUsername = googleName;
        }

        if (autoUsername.length >= 3) {
          const { error: insertError } = await supabase
            .from("usernames")
            .insert({ user_id: user.id, username: autoUsername });

          if (!insertError) {
            setUsername(autoUsername);
            setNeedsUsername(false);
            return;
          }
        }
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
