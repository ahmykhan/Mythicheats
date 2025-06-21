import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MythicHeader from "@/components/MythicHeader";
import SubjectManager from "@/components/cms/SubjectManager";
import SubjectViewer from "@/components/cms/SubjectViewer";
import EnhancedBackground from "@/components/background/EnhancedBackground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Settings, LogOut, FolderCog, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/context/ThemeContext";

const ADMIN_EMAIL = "furyboy4592@gmail.com";

const CourseFiles = () => {
  const [activeTab, setActiveTab] = useState("viewer");
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
          setUserEmail("furyboy4592@gmail.com");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setUserEmail("furyboy4592@gmail.com");
      }
    };

    getSession();
  }, [theme]);

  const handleLogout = () => {
    toast({
      title: "Logging out",
      description: "You have been successfully logged out",
    });
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
    <div className={`min-h-screen w-full overflow-x-hidden transition-all duration-500 ease-in-out theme-${theme} relative`}>
      <EnhancedBackground />
      
      <div className="container mx-auto px-4 py-6 transition-all duration-500 relative z-10">
        <MythicHeader />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Tabs 
            defaultValue="viewer" 
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="glass-card rounded-2xl p-2 mb-8 shadow-md">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger 
                  value="viewer"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Course Materials
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger 
                    value="manager"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                  >
                    <FolderCog className="mr-2 h-4 w-4" />
                    Subject Manager
                  </TabsTrigger>
                )}
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
              <TabsContent value="viewer" className="content-transition">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <SubjectViewer isAdmin={isAdmin} />
                </motion.div>
              </TabsContent>

              {isAdmin && (
                <TabsContent value="manager" className="content-transition">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <SubjectManager />
                  </motion.div>
                </TabsContent>
              )}

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
                        <h3 className="text-xl font-bold mb-2">CMS System Updated!</h3>
                        <p className="text-muted-foreground">New hierarchical subject management system is now available.</p>
                        <p className="text-xs text-muted-foreground mt-2">Today</p>
                      </motion.div>
                      
                      <motion.div 
                        variants={itemVariants} 
                        className="rounded-lg glass-card p-6"
                      >
                        <h3 className="text-xl font-bold mb-2">Enhanced UI</h3>
                        <p className="text-muted-foreground">Beautiful new background animations and improved visual design.</p>
                        <p className="text-xs text-muted-foreground mt-2">1 hour ago</p>
                      </motion.div>
                      
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
                      <h3 className="text-xl font-bold mb-2">Welcome to the Course Portal</h3>
                      <p className="text-muted-foreground">Access your course materials through the organized subject hierarchy.</p>
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
                    <p className="mb-4"><strong>Role:</strong> {isAdmin ? "Administrator" : "Student"}</p>
                    
                    <h3 className="text-lg font-bold mb-4 mt-6">Appearance</h3>
                    <p className="mb-2">Current theme: <span className="font-semibold capitalize">{theme}</span></p>
                    <p className="mb-4">Use the theme selector in the top right corner to change the site's appearance.</p>
                    
                    {isAdmin && (
                      <>
                        <h3 className="text-lg font-bold mb-4 mt-6">Admin Features</h3>
                        <p className="mb-2">• Subject Manager: Create and organize course subjects</p>
                        <p className="mb-2">• Hierarchical Folders: Manage subfolders within subjects</p>
                        <p className="mb-4">• Google Drive Integration: Link folders to Drive content</p>
                      </>
                    )}
                    
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
