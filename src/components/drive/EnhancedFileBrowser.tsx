import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Folder, FileText, FileSpreadsheet, FilePen, FileCheck, FileVideo, FileAudio, FileImage, File, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { listFiles, GoogleDriveFile, getGoogleDriveFileLink, getDirectDownloadLink, getMimeTypeIcon } from '@/services/googleDriveService';

interface EnhancedFileBrowserProps {
  folderId: string;
  initialFolderName?: string;
}

const EnhancedFileBrowser: React.FC<EnhancedFileBrowserProps> = ({ folderId, initialFolderName = "Drive Files" }) => {
  const { theme } = useTheme();
  const [currentFolderId, setCurrentFolderId] = useState(folderId);
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([{ id: folderId, name: initialFolderName }]);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(true);

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
    window.open(getGoogleDriveFileLink(file.id, file.mimeType), "_blank");
  };

  const navigateToFolder = (id: string, index: number) => {
    setCurrentFolderId(id);
    setFolderPath(folderPath.slice(0, index + 1));
  };

  const goBack = () => {
    if (folderPath.length > 1) {
      const newPath = folderPath.slice(0, -1);
      setCurrentFolderId(newPath[newPath.length - 1].id);
      setFolderPath(newPath);
    }
  };

  const getFileIcon = (mimeType: string) => {
    switch (getMimeTypeIcon(mimeType)) {
      case "pdf": return <FileText className="h-10 w-10 text-red-500" />;
      case "doc": return <FilePen className="h-10 w-10 text-blue-500" />;
      case "xls": return <FileSpreadsheet className="h-10 w-10 text-green-700" />;
      case "ppt": return <FileCheck className="h-10 w-10 text-orange-500" />;
      case "image": return <FileImage className="h-10 w-10 text-green-500" />;
      case "audio": return <FileAudio className="h-10 w-10 text-purple-500" />;
      case "video": return <FileVideo className="h-10 w-10 text-blue-400" />;
      default: return <File className="h-10 w-10 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen w-full p-6 bg-background text-foreground transition-colors duration-300">
      <AnimatePresence mode="wait">
        <motion.div key={currentFolderId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto">
          <motion.h1 className="text-4xl font-bold mb-8 text-center font-display text-foreground" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            {folderPath[folderPath.length - 1].name}
          </motion.h1>

          <div className="flex flex-wrap items-center mb-6 text-sm bg-card border border-border p-3 rounded-lg">
            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <span className={`cursor-pointer hover:underline ${index === folderPath.length - 1 ? 'font-semibold' : ''}`} onClick={() => navigateToFolder(folder.id, index)}>
                  {folder.name}
                </span>
                {index < folderPath.length - 1 && <ChevronLeft className="mx-2 rotate-180 h-4 w-4" />}
              </React.Fragment>
            ))}
          </div>

          {folderPath.length > 1 && (
            <div className="mb-6">
              <Button variant="outline" onClick={goBack} className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <motion.div className="w-16 h-16 border-4 border-t-primary rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer bg-card border border-border hover:bg-accent/50 transition-all"
                  onClick={() => file.mimeType === "application/vnd.google-apps.folder" ? handleFolderClick(file) : handleFileClick(file)}
                >
                  <div className="relative mb-4">
                    {file.mimeType === "application/vnd.google-apps.folder" ? (
                      <Folder className="h-16 w-16 text-primary" />
                    ) : getFileIcon(file.mimeType)}
                  </div>
                  <p className="text-center font-medium text-sm truncate w-full text-foreground">{file.name}</p>
                  {file.mimeType !== "application/vnd.google-apps.folder" && (
                    <Button variant="ghost" size="icon" className="mt-2 w-8 h-8 opacity-60 hover:opacity-100" onClick={(e) => { e.stopPropagation(); window.open(getDirectDownloadLink(file.id), "_blank"); }}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
              {files.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <p className="text-lg text-muted-foreground">This folder is empty</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EnhancedFileBrowser;
