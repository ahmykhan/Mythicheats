
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

// Full folder structure with mock data
const folderStructure: Record<string, FileOrFolderItem[]> = {
  "root": [
    {
      id: "folder1",
      name: "CS Assignments",
      type: "folder"
    },
    {
      id: "folder2",
      name: "Study Notes",
      type: "folder"
    },
    {
      id: "folder3",
      name: "Past Exams",
      type: "folder"
    },
    {
      id: "file1",
      name: "Course Syllabus.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/file/d/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e/view?usp=sharing"
    },
    {
      id: "file2",
      name: "Academic Calendar.docx",
      type: "file",
      fileType: "doc",
      webViewLink: "https://drive.google.com/file/d/1XdY62HoZkHUt6JTV3L8Ox9yCveUMM-F1/view?usp=sharing"
    }
  ],
  "folder1": [
    {
      id: "folder1-1",
      name: "Programming Assignments",
      type: "folder"
    },
    {
      id: "folder1-2",
      name: "Theory Assignments",
      type: "folder"
    },
    {
      id: "file3",
      name: "Assignment Rubric.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/file/d/1vEsD6mJGT8LbF2P_r3v1QKpLtmAT_45z/view?usp=sharing"
    }
  ],
  "folder1-1": [
    {
      id: "file4",
      name: "Java Project.zip",
      type: "file",
      fileType: "zip",
      webViewLink: "https://drive.google.com/file/d/1ZO2fj9KxCGvPtVUyl3Pxm4EKWlUju56t/view?usp=sharing"
    },
    {
      id: "file5",
      name: "Python Challenge.py",
      type: "file",
      fileType: "code",
      webViewLink: "https://drive.google.com/file/d/1n5lSosX1SeMDc_W9bInTJ7xVL6sm2qHp/view?usp=sharing"
    }
  ],
  "folder1-2": [
    {
      id: "file6",
      name: "Algorithm Analysis.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/file/d/1E8JRqVyzbwR9qfHxDjgD3lAEpfTeMnZx/view?usp=sharing"
    },
    {
      id: "file7",
      name: "Database Theory.docx",
      type: "file",
      fileType: "doc",
      webViewLink: "https://drive.google.com/file/d/1sT9Tx4GwNuJMQkK0uIF1Wm_C8OZ2LOE8/view?usp=sharing"
    }
  ],
  "folder2": [
    {
      id: "folder2-1",
      name: "First Semester",
      type: "folder"
    },
    {
      id: "folder2-2",
      name: "Second Semester",
      type: "folder"
    }
  ],
  "folder2-1": [
    {
      id: "file8",
      name: "Introduction to Computer Science.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/file/d/1JpUVRIqdHGglOlaIzABG-BJRZSrF4tx7/view?usp=sharing"
    },
    {
      id: "file9",
      name: "Linear Algebra Notes.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/file/d/1PKRHDguzXp5uL6_BAGw2v4eA0k8IT-B3/view?usp=sharing"
    }
  ],
  "folder2-2": [
    {
      id: "file10",
      name: "Advanced Algorithms.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/file/d/1mH0iCj3Hd4EqrGcyJ-tBRzp1Og3K5QIU/view?usp=sharing"
    },
    {
      id: "file11",
      name: "Object Oriented Programming.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/file/d/1D5rZ3XS4UAiVVXjy7HTXnX93mPNE1J70/view?usp=sharing"
    }
  ],
  "folder3": [
    {
      id: "folder3-1",
      name: "Midterm Exams",
      type: "folder"
    },
    {
      id: "folder3-2",
      name: "Final Exams",
      type: "folder"
    }
  ],
  "folder3-1": [
    {
      id: "file12",
      name: "Midterm 2023.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/file/d/1wMfS0RMKhc4qZBTqoYVBsbnx8HjyEZDw/view?usp=sharing"
    },
    {
      id: "file13",
      name: "Midterm 2022.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/file/d/1vYJXx4EAe0aTZ4_cqw4CLz9Ko2pj-5XQ/view?usp=sharing"
    }
  ],
  "folder3-2": [
    {
      id: "file14",
      name: "Final Exam 2023.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/file/d/1Q4l2P2p_GhsNk4zAwzpfiJUJSVD4eH9U/view?usp=sharing"
    },
    {
      id: "file15",
      name: "Final Exam 2022.pdf",
      type: "file",
      fileType: "pdf",
      webViewLink: "https://drive.google.com/file/d/1-sQl9scWl-Fiz5MywqZ8UKI-dMvDKcsC/view?usp=sharing"
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
        let fetchedFiles = folderStructure[currentFolderId] || [];
        
        if (fetchedFiles.length === 0 && currentFolderId !== "root") {
          setError("Folder not found or empty");
        } else {
          setFiles(fetchedFiles);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
        setError("Could not access files. Using your provided Google Drive link directly.");
        toast({
          title: "Info",
          description: "Unable to access files. Please try again.",
          variant: "default",
        });
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

  // Open the main Google Drive folder
  const handleOpenMainDriveLink = () => {
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
          onClick={handleOpenMainDriveLink}
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
          onClick={handleOpenMainDriveLink} 
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
                } else if ('webViewLink' in item) {
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
