
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Folder, 
  FileText, 
  FileSpreadsheet, 
  FilePen, 
  FileCheck,
  FileVideo, 
  FileAudio, 
  FileImage,
  File,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { 
  listFiles, 
  GoogleDriveFile,
  getGoogleDriveFileLink,
  getDirectDownloadLink,
  getMimeTypeIcon
} from '@/services/googleDriveService';

interface EnhancedFileBrowserProps {
  folderId: string;
  initialFolderName?: string;
}

const EnhancedFileBrowser: React.FC<EnhancedFileBrowserProps> = ({ 
  folderId, 
  initialFolderName = "Drive Files" 
}) => {
  const { theme } = useTheme();
  const [currentFolderId, setCurrentFolderId] = useState(folderId);
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([
    { id: folderId, name: initialFolderName },
  ]);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const handleFolderClick = (folder: GoogleDriveFile) => {
    setCurrentFolderId(folder.id);
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
  };

  const handleFileClick = (file: GoogleDriveFile) => {
    const viewUrl = getGoogleDriveFileLink(file.id, file.mimeType);
    window.open(viewUrl, "_blank");
  };

  const navigateToFolder = (folderId: string, index: number) => {
    setCurrentFolderId(folderId);
    setFolderPath(folderPath.slice(0, index + 1));
  };

  const goBack = () => {
    if (folderPath.length > 1) {
      const newPath = folderPath.slice(0, -1);
      setCurrentFolderId(newPath[newPath.length - 1].id);
      setFolderPath(newPath);
    }
  };

  const getFileIcon = (mimeType: string, fileType?: string) => {
    switch (fileType || getMimeTypeIcon(mimeType)) {
      case "pdf":
        return <FileText className="h-10 w-10 text-red-500" />;
      case "doc":
        return <FilePen className="h-10 w-10 text-blue-500" />;
      case "xls":
        return <FileSpreadsheet className="h-10 w-10 text-green-700" />;
      case "ppt":
        return <FileCheck className="h-10 w-10 text-orange-500" />;
      case "image":
        return <FileImage className="h-10 w-10 text-green-500" />;
      case "audio":
        return <FileAudio className="h-10 w-10 text-purple-500" />;
      case "video":
        return <FileVideo className="h-10 w-10 text-blue-400" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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

  const getThemeStyles = () => {
    switch(theme) {
      case 'dark':
        return 'bg-gradient-to-br from-gray-900 to-gray-800 text-white';
      case 'light':
        return 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800';
      case 'pink':
        return 'bg-gradient-to-br from-pink-50 to-pink-100 text-gray-800';
      case 'purple':
        return 'bg-gradient-to-br from-purple-100 to-purple-50 text-gray-800';
      default:
        return 'bg-gradient-to-br from-gray-900 to-gray-800 text-white';
    }
  };

  const getCardStyles = () => {
    switch(theme) {
      case 'dark':
        return 'backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10';
      case 'light':
        return 'backdrop-blur-md bg-white/80 border border-gray-200 hover:bg-white/90';
      case 'pink':
        return 'backdrop-blur-md bg-white/70 border border-pink-200 hover:bg-pink-50/70';
      case 'purple':
        return 'backdrop-blur-md bg-white/70 border border-purple-200 hover:bg-purple-50/70';
      default:
        return 'backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10';
    }
  };

  return (
    <div className={`min-h-screen w-full p-6 ${getThemeStyles()} transition-colors duration-300`}>
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentFolderId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto"
        >
          {/* Heading */}
          <motion.h1 
            className={`text-4xl font-bold mb-8 text-center font-display ${theme === 'dark' ? 'text-white' : ''}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {folderPath[folderPath.length - 1].name}
          </motion.h1>

          {/* Breadcrumb Navigation */}
          <motion.div 
            className={`flex flex-wrap items-center mb-6 text-sm ${getCardStyles()} p-3 rounded-lg`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <span 
                  className={`cursor-pointer hover:underline ${index === folderPath.length - 1 ? 'font-semibold' : ''}`}
                  onClick={() => navigateToFolder(folder.id, index)}
                >
                  {folder.name}
                </span>
                {index < folderPath.length - 1 && (
                  <ChevronLeft className="mx-2 rotate-180 h-4 w-4" />
                )}
              </React.Fragment>
            ))}
          </motion.div>

          {/* Back Button */}
          {folderPath.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6"
            >
              <Button 
                variant="outline" 
                onClick={goBack}
                className={`flex items-center space-x-2 ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : ''}`}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-24">
              <motion.div 
                className="w-16 h-16 border-4 border-t-primary rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}

          {/* Files Grid */}
          {!loading && (
            <motion.div 
              className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer ${getCardStyles()} transition-all duration-200`}
                  onClick={() => {
                    if (file.mimeType === "application/vnd.google-apps.folder") {
                      handleFolderClick(file);
                    } else {
                      handleFileClick(file);
                    }
                  }}
                >
                  <motion.div 
                    className="relative mb-4"
                    whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {file.mimeType === "application/vnd.google-apps.folder" ? (
                      <Folder className={`h-16 w-16 ${theme === 'dark' ? 'text-primary-300' : theme === 'pink' ? 'text-pink-400' : theme === 'purple' ? 'text-purple-500' : 'text-primary'}`} />
                    ) : (
                      getFileIcon(file.mimeType)
                    )}
                  </motion.div>
                  <p className="text-center font-medium text-sm truncate w-full">
                    {file.name}
                  </p>
                  {file.mimeType !== "application/vnd.google-apps.folder" && (
                    <motion.div 
                      className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(getDirectDownloadLink(file.id), "_blank");
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {/* Empty State */}
              {files.length === 0 && (
                <motion.div 
                  className="col-span-full text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    This folder is empty
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EnhancedFileBrowser;
