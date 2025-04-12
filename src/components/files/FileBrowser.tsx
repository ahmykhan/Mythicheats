
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
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define types
type FileItem = {
  id: string;
  name: string;
  type: "file";
  fileType: string;
  webViewLink?: string;
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

// Sample data to use when API access is restricted
const sampleFiles: FileOrFolderItem[] = [
  {
    id: "folder1",
    name: "Assignments",
    type: "folder"
  },
  {
    id: "folder2",
    name: "Notes",
    type: "folder"
  },
  {
    id: "folder3",
    name: "Past Papers",
    type: "folder"
  },
  {
    id: "file1",
    name: "Physics Assignment 1.pdf",
    type: "file",
    fileType: "pdf",
    webViewLink: "https://drive.google.com/file/d/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e/view"
  },
  {
    id: "file2",
    name: "Chemistry Notes.docx",
    type: "file",
    fileType: "doc",
    webViewLink: "https://drive.google.com/drive/folders/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e"
  },
  {
    id: "file3",
    name: "Math Past Paper 2024.pdf",
    type: "file",
    fileType: "pdf",
    webViewLink: "https://drive.google.com/drive/folders/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e"
  }
];

// Folder mapping to simulate navigation
const folderContents: Record<string, FileOrFolderItem[]> = {
  "folder1": [
    {
      id: "file4",
      name: "Assignment 1.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/drive/folders/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e"
    },
    {
      id: "file5",
      name: "Assignment 2.docx",
      type: "file",
      fileType: "doc",
      webViewLink: "https://drive.google.com/drive/folders/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e"
    }
  ],
  "folder2": [
    {
      id: "file6",
      name: "Chapter 1 Notes.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/drive/folders/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e"
    },
    {
      id: "file7",
      name: "Chapter 2 Notes.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/drive/folders/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e"
    }
  ],
  "folder3": [
    {
      id: "file8",
      name: "2023 Exam Paper.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/drive/folders/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e"
    },
    {
      id: "file9",
      name: "2022 Exam Paper.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/drive/folders/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e"
    }
  ]
};

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

  // Mock fetching files from Google Drive
  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get files based on the current folder ID
        let fetchedFiles = currentFolderId === "root" || currentFolderId === "1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e"
          ? sampleFiles
          : folderContents[currentFolderId] || [];
        
        setFiles(fetchedFiles);
      } catch (error) {
        console.error("Error fetching files:", error);
        setError("Could not access files. Using your provided Google Drive link directly.");
        toast({
          title: "Info",
          description: "Direct API access is restricted. Opening folder link in new tab.",
          variant: "default",
        });
        
        // Automatically open the shared folder link
        window.open("https://drive.google.com/drive/folders/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e", "_blank");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFiles();
  }, [currentFolderId, toast]);
  
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

  const handleOpenDriveLink = () => {
    window.open("https://drive.google.com/drive/folders/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e", "_blank");
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
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={handleOpenDriveLink}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in Google Drive
        </Button>
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
        
        <Button 
          variant="outline" 
          onClick={handleOpenDriveLink} 
          className="mb-4 ml-auto"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in Google Drive
        </Button>
      </div>
      
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
              <div>
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
