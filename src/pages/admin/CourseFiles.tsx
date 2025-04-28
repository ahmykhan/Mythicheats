
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MythicHeader from "@/components/MythicHeader";
import GoogleDriveIframe from "@/components/drive/GoogleDriveIframe";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/context/ThemeContext";
import ThemeSelector from "@/components/theme/ThemeSelector";

const MAIN_FOLDER_ID = "1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e";
const ADMIN_EMAIL = "furyboy4592@gmail.com";

const CourseFiles = () => {
  const [activeTab, setActiveTab] = useState("materials");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();
  const { theme } = useTheme();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setUserEmail(data.session.user.email);
        } else {
          // For demo purposes, set a default email
          setUserEmail("furyboy4592@gmail.com"); // Changed to match admin email for testing
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setUserEmail("furyboy4592@gmail.com");
      }
    };

    getSession();
    console.log("Current theme:", theme);
  }, [theme]);

  const handleLogout = () => {
    toast({
      title: "Logging out",
      description: "You have been successfully logged out",
    });
    // In a real app, you would implement actual logout logic here
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

  const isAdmin = userEmail === ADMIN_EMAIL;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, duration: 0.5 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-all duration-500 ease-in-out theme-${theme}`}>
      <div className="container mx-auto px-4 py-6 transition-all duration-500">
        <MythicHeader />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Tabs 
            defaultValue="materials" 
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="glass-card rounded-2xl p-2 mb-8 shadow-md">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger 
                  value="materials"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  Course Materials
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="settings"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <TabsContent value="materials" className="content-transition">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <GoogleDriveIframe folderId={MAIN_FOLDER_ID} />
                </motion.div>
              </TabsContent>

              <TabsContent value="notifications" className="content-transition">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {isAdmin ? (
                    <>
                      <motion.div 
                        variants={itemVariants} 
                        className="rounded-lg glass-card p-6"
                      >
                        <h3 className="text-xl font-bold mb-2">New Course Released!</h3>
                        <p className="text-muted-foreground">Check out the latest course on advanced techniques.</p>
                        <p className="text-xs text-muted-foreground mt-2">2 days ago</p>
                      </motion.div>
                      
                      <motion.div 
                        variants={itemVariants} 
                        className="rounded-lg glass-card p-6"
                      >
                        <h3 className="text-xl font-bold mb-2">Weekly Challenge</h3>
                        <p className="text-muted-foreground">New weekly challenge available. Test your skills now!</p>
                        <p className="text-xs text-muted-foreground mt-2">5 days ago</p>
                      </motion.div>
                      
                      <motion.div 
                        variants={itemVariants} 
                        className="rounded-lg glass-card p-6"
                      >
                        <h3 className="text-xl font-bold mb-2">Admin Notice</h3>
                        <p className="text-muted-foreground">Special notifications for admin users only.</p>
                        <p className="text-xs text-muted-foreground mt-2">1 day ago</p>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div 
                      variants={itemVariants} 
                      className="rounded-lg glass-card p-6"
                    >
                      <h3 className="text-xl font-bold mb-2">No Notifications</h3>
                      <p className="text-muted-foreground">You don't have any notifications at this time.</p>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="settings" className="content-transition">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <motion.div 
                    variants={itemVariants}
                    className="rounded-lg glass-card p-6"
                  >
                    <h3 className="text-xl font-bold mb-4">Profile Settings</h3>
                    <p className="mb-4"><strong>Email:</strong> {userEmail || "loading..."}</p>
                    
                    <h3 className="text-lg font-bold mb-4 mt-6">Appearance</h3>
                    <p className="mb-2">Current theme: <span className="font-semibold capitalize">{theme}</span></p>
                    <p className="mb-4">Use the theme selector in the top right corner to change the site's appearance.</p>
                    
                    <div className="mt-8">
                      <Button 
                        variant="destructive" 
                        className="flex items-center transition-all"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseFiles;
