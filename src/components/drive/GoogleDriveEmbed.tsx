
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Folder, File, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { parseGoogleDriveId, listFiles, GoogleDriveFile } from "@/services/googleDriveService";

interface GoogleDriveEmbedProps {
  folderId: string;
  title?: string;
  height?: number;
}

const GoogleDriveEmbed: React.FC<GoogleDriveEmbedProps> = ({
  folderId,
  title = "Google Drive Files",
  height = 600,
}) => {
  const [currentFolderId, setCurrentFolderId] = useState(folderId);
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([
    { id: folderId, name: title },
  ]);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Load files from the current folder
  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const fileList = await listFiles(currentFolderId);
        setFiles(fileList);
      } catch (error) {
        console.error("Error fetching files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [currentFolderId]);

  // Handle folder click
  const handleFolderClick = (folder: GoogleDriveFile) => {
    setCurrentFolderId(folder.id);
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
  };

  // Handle file click
  const handleFileClick = (file: GoogleDriveFile) => {
    const viewUrl = `https://drive.google.com/file/d/${file.id}/view`;
    window.open(viewUrl, "_blank");
  };

  // Navigate to a specific folder in the breadcrumb
  const navigateToFolder = (folderId: string, index: number) => {
    setCurrentFolderId(folderId);
    setFolderPath(folderPath.slice(0, index + 1));
  };

  // Go back to the parent folder
  const goBack = () => {
    if (folderPath.length > 1) {
      const newPath = folderPath.slice(0, -1);
      setCurrentFolderId(newPath[newPath.length - 1].id);
      setFolderPath(newPath);
    }
  };

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Get appropriate icon for file type
  const getFileIcon = (mimeType: string) => {
    if (mimeType === "application/vnd.google-apps.folder") {
      return <Folder className="h-12 w-12 text-primary" />;
    }
    return <File className="h-12 w-12 text-gray-500 dark:text-gray-400" />;
  };

  return (
    <div className={`google-drive-container ${darkMode ? 'dark' : ''}`} style={{ minHeight: height }}>
      <div className="flex justify-between items-center mb-6">
        {/* Title with animation */}
        <motion.h2 
          className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-300 dark:from-primary-400 dark:to-primary-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {title}
        </motion.h2>

        {/* Dark/Light mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-gray-700" />
          )}
        </Button>
      </div>

      {/* Breadcrumb navigation */}
      <Card className="p-2 mb-4 backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
        <Breadcrumb>
          <BreadcrumbList>
            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <BreadcrumbItem>
                  {index === folderPath.length - 1 ? (
                    <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      onClick={() => navigateToFolder(folder.id, index)}
                      className="cursor-pointer hover:text-primary"
                    >
                      {folder.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < folderPath.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </Card>

      {/* Back button (shows only when inside a folder) */}
      {folderPath.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <Button 
            variant="outline" 
            onClick={goBack}
            className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Files and folders grid */}
      {!loading && (
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {files.map((file) => (
            <motion.div
              key={file.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center p-4 rounded-lg cursor-pointer backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
              onClick={() => {
                if (file.mimeType === "application/vnd.google-apps.folder") {
                  handleFolderClick(file);
                } else {
                  handleFileClick(file);
                }
              }}
            >
              {getFileIcon(file.mimeType)}
              <p className="mt-2 text-center font-medium text-sm truncate w-full dark:text-gray-200">
                {file.name}
              </p>
            </motion.div>
          ))}

          {/* Empty state */}
          {files.length === 0 && !loading && (
            <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
              This folder is empty
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default GoogleDriveEmbed;

// Custom breadcrumb page component
const BreadcrumbPage = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={`font-medium text-foreground dark:text-gray-200 ${className}`}
    aria-current="page"
    {...props}
  />
);
