
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import EnhancedFileBrowser from "@/components/drive/EnhancedFileBrowser";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeSelector from "@/components/theme/ThemeSelector";

const MAIN_FOLDER_ID = "1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e";

const CourseFiles = () => {
  return (
    <ThemeProvider>
      <div className="overflow-hidden h-screen w-screen">
        <ThemeSelector />
        <EnhancedFileBrowser 
          folderId={MAIN_FOLDER_ID} 
          initialFolderName="Course Materials"
        />
      </div>
    </ThemeProvider>
  );
};

export default CourseFiles;
