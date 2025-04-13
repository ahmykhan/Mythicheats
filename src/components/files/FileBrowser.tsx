
import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  File,
  FileText,
  Folder,
  FileSpreadsheet,
  FilePen,
  FileCheck,
  Loader2,
  RefreshCw,
  FileVideo,
  FileAudio,
  FileImage,
  FileArchive,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  listFiles,
  getMimeTypeIcon,
  getGoogleDriveFileLink,
  getDirectDownloadLink,
  getFileExtension
} from "@/services/googleDriveService";

// Define types
type FileItem = {
  id: string;
  name: string;
  type: "file";
  fileType: string;
  webViewLink: string;
  downloadLink?: string;
};

type FolderItem = {
  id: string;
  name: string;
  type: "folder";
};

type FileOrFolderItem = FileItem | FolderItem;

interface FileBrowserProps {
  path: string[];
  onFolderClick: (folder: string, folderId: string) => void;
  onNavigateUp: () => void;
  searchQuery?: string;
  filter?: "assignments" | "notes" | "past-papers";
  currentFolderId: string;
}

export const FileBrowser: React.FC<FileBrowserProps> = ({
  path,
  onFolderClick,
  onNavigateUp,
  searchQuery = "",
  filter,
  currentFolderId
}) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileOrFolderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch files from Google Drive
  const fetchFiles = async () => {
    if (!currentFolderId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const driveFiles = await listFiles(currentFolderId);
      
      // Convert Google Drive files to our format
      const formattedFiles: FileOrFolderItem[] = driveFiles.map(file => {
        if (file.mimeType === "application/vnd.google-apps.folder") {
          return {
            id: file.id,
            name: file.name,
            type: "folder"
          };
        } else {
          // Extract file extension from name
          const fileExtension = getFileExtension(file.name);
          const fileType = getMimeTypeIcon(file.mimeType, fileExtension);
          
          return {
            id: file.id,
            name: file.name,
            type: "file",
            fileType,
            webViewLink: file.webViewLink || getGoogleDriveFileLink(file.id, file.mimeType),
            downloadLink: getDirectDownloadLink(file.id)
          };
        }
      });
      
      setFiles(formattedFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to load files");
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch and whenever folder changes
  useEffect(() => {
    fetchFiles();
  }, [currentFolderId]);
  
  // Filter items based on search query and filter type
  const filteredItems = useMemo(() => {
    let filtered = files;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by type if specified
    if (filter) {
      filtered = filtered.filter(item => {
        if (item.type === "folder") {
          return filter === "assignments" && item.name.toLowerCase().includes("assignment") ||
                 filter === "notes" && (
                   item.name.toLowerCase().includes("lecture") || 
                   item.name.toLowerCase().includes("note")
                 ) ||
                 filter === "past-papers" && (
                   item.name.toLowerCase().includes("past") || 
                   item.name.toLowerCase().includes("exam")
                 );
        }
        
        return filter === "assignments" && item.name.toLowerCase().includes("assignment") ||
               filter === "notes" && (
                 item.name.toLowerCase().includes("lecture") || 
                 item.name.toLowerCase().includes("note")
               ) ||
               filter === "past-papers" && (
                 item.name.toLowerCase().includes("past") || 
                 item.name.toLowerCase().includes("exam")
               );
      });
    }
    
    // Always show folders first
    return [
      ...filtered.filter(item => item.type === "folder"), 
      ...filtered.filter(item => item.type === "file")
    ];
  }, [files, searchQuery, filter]);

  // Function to get the appropriate icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-6 w-6 text-red-500" />;
      case "image":
        return <FileImage className="h-6 w-6 text-green-500" />;
      case "archive":
        return <FileArchive className="h-6 w-6 text-amber-500" />;
      case "doc":
        return <FilePen className="h-6 w-6 text-blue-500" />;
      case "xls":
        return <FileSpreadsheet className="h-6 w-6 text-green-700" />;
      case "ppt":
        return <FileCheck className="h-6 w-6 text-orange-500" />;
      case "audio":
        return <FileAudio className="h-6 w-6 text-purple-500" />;
      case "video":
        return <FileVideo className="h-6 w-6 text-blue-400" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <div className="flex justify-center gap-4 mt-4">
          <Button variant="outline" onClick={fetchFiles}>
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  // Rizzons-style grid view
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center">
          {path.length > 1 && (
            <Button 
              variant="ghost" 
              onClick={onNavigateUp} 
              className="mr-2"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <span className="hidden sm:inline">Current location:</span>
            <span className="font-medium text-gray-700 ml-1">{path[path.length - 1]}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? "List View" : "Grid View"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={fetchFiles}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
      
      {/* Rizzons-style file grid */}
      {filteredItems.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" : "flex flex-col gap-2"}>
          {filteredItems.map((item) => (
            viewMode === "grid" ? (
              <div 
                key={item.id} 
                className="flex flex-col items-center cursor-pointer rounded-md transition-all duration-200 hover:bg-gray-100 p-2"
                onClick={() => {
                  if (item.type === "folder") {
                    onFolderClick(item.name, item.id);
                  } else if ('webViewLink' in item && item.webViewLink) {
                    window.open(item.webViewLink, "_blank");
                  }
                }}
              >
                <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded-lg mb-2">
                  {item.type === "folder" ? (
                    <Folder className="h-16 w-16 text-gray-500" />
                  ) : (
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {getFileIcon('fileType' in item ? item.fileType : '')}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center w-full">
                  <p className="font-medium text-sm truncate max-w-full">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.type === "folder" ? "Folder" : getFileExtension(item.name).toUpperCase()}
                  </p>
                </div>
              </div>
            ) : (
              <div 
                key={item.id} 
                className="flex items-center justify-between px-4 py-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  if (item.type === "folder") {
                    onFolderClick(item.name, item.id);
                  } else if ('webViewLink' in item && item.webViewLink) {
                    window.open(item.webViewLink, "_blank");
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  {item.type === "folder" ? (
                    <Folder className="h-5 w-5 text-gray-500" />
                  ) : (
                    getFileIcon('fileType' in item ? item.fileType : '')
                  )}
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                {item.type === "file" && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      if ('downloadLink' in item && item.downloadLink) {
                        window.open(item.downloadLink, "_blank");
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-gray-500">No items found in this location</p>
        </div>
      )}
    </div>
  );
};
