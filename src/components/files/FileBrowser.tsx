import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  File,
  FileText,
  FolderOpen,
  FileArchive,
  FileImage,
  FileMusic,
  FilePen,
  FileCheck,
  Loader2,
  ExternalLink,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  listFiles,
  getMimeTypeIcon,
  getGoogleDriveFileLink,
  isUsingFallbackData
} from "@/services/googleDriveService";

// Define types
type FileItem = {
  id: string;
  name: string;
  type: "file";
  fileType: string;
  webViewLink: string;
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
  const [usingMockData, setUsingMockData] = useState(false);

  // Fetch files from Google Drive
  const fetchFiles = async () => {
    if (!currentFolderId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const driveFiles = await listFiles(currentFolderId);
      
      // Check if using fallback data
      setUsingMockData(isUsingFallbackData());
      
      // Convert Google Drive files to our format
      const formattedFiles: FileOrFolderItem[] = driveFiles.map(file => {
        if (file.mimeType === "application/vnd.google-apps.folder") {
          return {
            id: file.id,
            name: file.name,
            type: "folder"
          };
        } else {
          // Extract file extension from name or mimeType
          const fileType = file.fileExtension || getMimeTypeIcon(file.mimeType);
          
          return {
            id: file.id,
            name: file.name,
            type: "file",
            fileType,
            webViewLink: file.webViewLink || getGoogleDriveFileLink(file.id, file.mimeType)
          };
        }
      });
      
      setFiles(formattedFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to load files from Google Drive");
      toast({
        title: "Error",
        description: "Failed to load files from Google Drive",
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
      // For folder items, check if their name matches the filter
      filtered = filtered.filter(item => {
        if (item.type === "folder") {
          return filter === "assignments" && item.name.toLowerCase().includes("assignment") ||
                 filter === "notes" && item.name.toLowerCase().includes("note") ||
                 filter === "past-papers" && (item.name.toLowerCase().includes("past") || 
                                              item.name.toLowerCase().includes("exam"));
        }
        
        // For file items, check their name as well
        return filter === "assignments" && item.name.toLowerCase().includes("assignment") ||
               filter === "notes" && item.name.toLowerCase().includes("note") ||
               filter === "past-papers" && (item.name.toLowerCase().includes("past") || 
                                            item.name.toLowerCase().includes("exam"));
      });
    }
    
    return filtered;
  }, [files, searchQuery, filter]);

  // Function to get the appropriate icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "image":
        return <FileImage className="h-4 w-4" />;
      case "zip":
      case "rar":
      case "archive":
        return <FileArchive className="h-4 w-4" />;
      case "doc":
      case "docx":
        return <FilePen className="h-4 w-4" />;
      case "ppt":
      case "pptx":
        return <FileCheck className="h-4 w-4" />;
      case "mp3":
      case "wav":
      case "audio":
        return <FileMusic className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  // Open the Google Drive folder
  const handleOpenDriveLink = () => {
    window.open(getGoogleDriveFileLink(currentFolderId, "application/vnd.google-apps.folder"), "_blank");
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
          <Button 
            variant="outline" 
            onClick={fetchFiles}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button 
            variant="outline" 
            onClick={handleOpenDriveLink}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Google Drive
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {path.length > 1 && (
          <Button 
            variant="outline" 
            onClick={onNavigateUp} 
            className="mb-4"
          >
            <ChevronUp className="h-4 w-4 mr-2" /> 
            Go Up
          </Button>
        )}
        
        <div className="flex gap-2 mb-4 ml-auto">
          <Button 
            variant="outline" 
            onClick={fetchFiles}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleOpenDriveLink}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Google Drive
          </Button>
        </div>
      </div>
      
      {usingMockData && (
        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
          <div>
            <p className="text-amber-800 text-sm">
              Unable to connect to Google Drive API. Showing example content.
              <br className="hidden sm:inline" />
              <span className="sm:ml-1">
                Please use "Open in Google Drive" to view actual files.
              </span>
            </p>
          </div>
        </div>
      )}
      
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className={`p-4 flex items-center cursor-pointer hover:bg-gray-50`}
              onClick={() => {
                if (item.type === "folder") {
                  onFolderClick(item.name, item.id);
                } else if ('webViewLink' in item && item.webViewLink) {
                  window.open(item.webViewLink, "_blank");
                }
              }}
            >
              {item.type === "folder" ? (
                <FolderOpen className="h-5 w-5 mr-3 text-blue-500" />
              ) : (
                <div className="mr-3 text-amber-500">
                  {getFileIcon('fileType' in item ? item.fileType : '')}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type === "folder" ? "Folder" : 
                   'fileType' in item ? item.fileType.toUpperCase() : "File"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No items found in this location</p>
        </div>
      )}
    </div>
  );
};
