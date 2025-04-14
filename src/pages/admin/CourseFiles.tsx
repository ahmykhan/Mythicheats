import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeSelector from "@/components/theme/ThemeSelector";
import MythicHeader from "@/components/MythicHeader";
import GoogleDriveIframe from "@/components/drive/GoogleDriveIframe";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const MAIN_FOLDER_ID = "1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e";

const CourseFiles = () => {
  const [activeTab, setActiveTab] = useState("materials");
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen w-full overflow-x-hidden transition-colors duration-300 bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto px-4 py-6">
        <div className="fixed top-4 right-4 z-50">
          <ThemeSelector />
        </div>
        
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
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger 
                value="materials"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Course Materials
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="materials" asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <GoogleDriveIframe folderId={MAIN_FOLDER_ID} />
                </motion.div>
              </TabsContent>

              <TabsContent value="notifications" asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="rounded-lg glass-card p-6 backdrop-blur-md bg-white/10 border border-white/20">
                    <h3 className="text-xl font-bold mb-2">New Course Released!</h3>
                    <p className="text-muted-foreground">Check out the latest course on advanced techniques.</p>
                    <p className="text-xs text-muted-foreground mt-2">2 days ago</p>
                  </div>
                  
                  <div className="rounded-lg glass-card p-6 backdrop-blur-md bg-white/10 border border-white/20">
                    <h3 className="text-xl font-bold mb-2">Weekly Challenge</h3>
                    <p className="text-muted-foreground">New weekly challenge available. Test your skills now!</p>
                    <p className="text-xs text-muted-foreground mt-2">5 days ago</p>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="settings" asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="rounded-lg glass-card p-6 backdrop-blur-md bg-white/10 border border-white/20">
                    <h3 className="text-xl font-bold mb-4">Profile Settings</h3>
                    <p className="mb-2"><strong>Email:</strong> user@example.com</p>
                    <p className="mb-4"><strong>Member since:</strong> January 2023</p>
                    
                    <h3 className="text-lg font-bold mb-4 mt-6">Appearance</h3>
                    <p className="mb-2">Change the theme using the selector in the top right corner.</p>
                    
                    <div className="mt-8">
                      <Button 
                        variant="destructive" 
                        className="flex items-center"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
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
