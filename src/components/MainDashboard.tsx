
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  MessageCircle, 
  LogOut, 
  Bell, 
  Download, 
  User, 
  Settings,
  FileText,
  PackageSearch,
  Calculator,
  CalendarDays
} from "lucide-react";
import ContentViewer from "./content/ContentViewer";
import ChatContainer from "./chat/ChatContainer";
import NotificationCenter from "./notifications/NotificationCenter";
import ProfileSettings from "./profile/ProfileSettings";
import AdminCourseManager from "./admin/AdminCourseManager";
import PastPapers from "./pastpapers/PastPapers";
import LostAndFound from "./lostfound/LostAndFound";
import FastGrader from "./grader/FastGrader";
import ThemeSelector from "./theme/ThemeSelector";
import AcademicHub from "./academic/AcademicHub";

interface MainDashboardProps {
  username: string;
  userEmail: string;
  onLogout: () => void;
}

const ADMIN_EMAIL = "furyboy4592@gmail.com";

const MainDashboard: React.FC<MainDashboardProps> = ({ username, userEmail, onLogout }) => {
  const [activeTab, setActiveTab] = useState("academic");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const { toast } = useToast();
  
  const isAdmin = userEmail === ADMIN_EMAIL;

  useEffect(() => {
    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast({
        title: "App Installed!",
        description: "Mythic Cheats has been installed on your device"
      });
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive notifications for new messages"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Mythic Cheats
              </h1>
              {isAdmin && (
                <span className="ml-2 px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">
                  Admin
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* PWA Install Button */}
              {isInstallable && (
                <Button
                  onClick={handleInstallPWA}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </Button>
              )}
              
              {/* Notifications */}
              {notificationPermission !== 'granted' && (
                <Button
                  onClick={requestNotificationPermission}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </Button>
              )}
              
              {/* Theme Toggle */}
              <ThemeSelector />

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{username}</span>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/80"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 max-w-5xl mx-auto">
            <TabsTrigger value="academic" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Academic Hub</span>
            </TabsTrigger>
            <TabsTrigger value="past-papers" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Past Papers</span>
            </TabsTrigger>
            <TabsTrigger value="grader" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Grader</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="lost-found" className="flex items-center gap-2">
              <PackageSearch className="h-4 w-4" />
              <span className="hidden sm:inline">Lost & Found</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="academic">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AcademicHub />
            </motion.div>
          </TabsContent>

          <TabsContent value="past-papers">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PastPapers />
            </motion.div>
          </TabsContent>

          <TabsContent value="grader">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FastGrader />
            </motion.div>
          </TabsContent>

          <TabsContent value="chat">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ChatContainer currentUsername={username} isAdmin={isAdmin} />
            </motion.div>
          </TabsContent>

          <TabsContent value="lost-found">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <LostAndFound
                onNavigateToDM={(room, prefillMessage) => {
                  setActiveTab("chat");
                  // Small delay to let the chat tab mount
                  setTimeout(() => {
                    window.dispatchEvent(
                      new CustomEvent("navigate-to-dm", { detail: { room, prefillMessage } })
                    );
                  }, 100);
                }}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <NotificationCenter isAdmin={isAdmin} />
            </motion.div>
          </TabsContent>

          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProfileSettings username={username} userEmail={userEmail} />
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* PWA Install Card for Mobile */}
        {isInstallable && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-4 right-4 sm:hidden z-50"
          >
            <Card className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Install Mythic Cheats</h3>
                  <p className="text-sm opacity-90">Get the full app experience</p>
                </div>
                <Button
                  onClick={handleInstallPWA}
                  size="sm"
                  variant="secondary"
                >
                  Install
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default MainDashboard;
