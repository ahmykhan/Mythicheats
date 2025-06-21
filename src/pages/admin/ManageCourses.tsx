
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "@/components/layout/AdminLayout";
import SubjectManager from "@/components/cms/SubjectManager";
import SubjectViewer from "@/components/cms/SubjectViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderCog, Eye } from "lucide-react";

const ManageCourses = () => {
  const [activeTab, setActiveTab] = useState("viewer");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, duration: 0.5 }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Course Management</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs 
            defaultValue="viewer" 
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="glass-card rounded-2xl p-2 mb-8 shadow-md">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="viewer"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Course Materials
                </TabsTrigger>
                <TabsTrigger 
                  value="manager"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <FolderCog className="mr-2 h-4 w-4" />
                  Subject Manager
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
                  <SubjectViewer isAdmin={true} />
                </motion.div>
              </TabsContent>

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
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default ManageCourses;
