
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
  Settings
} from "lucide-react";
import ContentViewer from "./content/ContentViewer";
import ChatRoom from "./chat/ChatRoom";
import NotificationCenter from "./notifications/NotificationCenter";
import ProfileSettings from "./profile/ProfileSettings";
import AdminCourseManager from "./admin/AdminCourseManager";

interface MainDashboardProps {
  username: string;
  userEmail: string;
  onLogout: () => void;
}

const ADMIN_EMAIL = "furyboy4592@gmail.com";

const MainDashboard: React.FC<MainDashboardProps> = ({ username, userEmail, onLogout }) => {
  const [activeTab, setActiveTab] = useState("courses");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mythic Cheats
              </h1>
              {isAdmin && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
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
              
              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium">{username}</span>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
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
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isAdmin ? (
                <AdminCourseManager />
              ) : (
                <ContentViewer />
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="chat">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ChatRoom currentUsername={username} isAdmin={isAdmin} />
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
