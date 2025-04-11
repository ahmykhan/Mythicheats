
import { useMemo } from "react";
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
  FileCheck
} from "lucide-react";

// Sample data - in a real application, this would come from an API
const sampleFiles = {
  "Courses": {
    type: "folder",
    children: {
      "Mathematics": {
        type: "folder",
        children: {
          "Assignments": {
            type: "folder",
            children: {
              "Assignment 1.pdf": { type: "file", fileType: "pdf" },
              "Assignment 2.pdf": { type: "file", fileType: "pdf" },
            }
          },
          "Notes": {
            type: "folder",
            children: {
              "Calculus.pdf": { type: "file", fileType: "pdf" },
              "Algebra.pdf": { type: "file", fileType: "pdf" },
            }
          },
          "Past Papers": {
            type: "folder",
            children: {
              "2023 Exam.pdf": { type: "file", fileType: "pdf" },
              "2022 Exam.pdf": { type: "file", fileType: "pdf" },
            }
          },
        }
      },
      "Physics": {
        type: "folder",
        children: {
          "Assignments": {
            type: "folder",
            children: {
              "Lab Report 1.pdf": { type: "file", fileType: "pdf" },
              "Lab Report 2.pdf": { type: "file", fileType: "pdf" },
            }
          },
          "Notes": {
            type: "folder",
            children: {
              "Mechanics.pdf": { type: "file", fileType: "pdf" },
              "Electromagnetism.pdf": { type: "file", fileType: "pdf" },
              "Wave Mechanics.pptx": { type: "file", fileType: "pptx" },
            }
          },
          "Past Papers": {
            type: "folder",
            children: {
              "2023 Final Exam.pdf": { type: "file", fileType: "pdf" },
              "2022 Final Exam.pdf": { type: "file", fileType: "pdf" },
              "2023 Midterm.pdf": { type: "file", fileType: "pdf" },
            }
          },
        }
      },
      "Computer Science": {
        type: "folder",
        children: {
          "Assignments": {
            type: "folder",
            children: {
              "Programming Assignment 1.zip": { type: "file", fileType: "zip" },
              "Programming Assignment 2.zip": { type: "file", fileType: "zip" },
              "Project Documentation.docx": { type: "file", fileType: "docx" },
            }
          },
          "Notes": {
            type: "folder",
            children: {
              "Algorithms.pdf": { type: "file", fileType: "pdf" },
              "Data Structures.pdf": { type: "file", fileType: "pdf" },
              "Class Diagrams.png": { type: "file", fileType: "png" },
            }
          },
          "Past Papers": {
            type: "folder",
            children: {
              "2023 Final.pdf": { type: "file", fileType: "pdf" },
              "2022 Final.pdf": { type: "file", fileType: "pdf" },
              "Practice Problems.pdf": { type: "file", fileType: "pdf" },
            }
          },
        }
      }
    }
  }
};

type FileType = {
  type: "file";
  fileType: string;
};

type FolderType = {
  type: "folder";
  children: Record<string, FileType | FolderType>;
};

type FileOrFolder = FileType | FolderType;

interface FileBrowserProps {
  path: string[];
  onFolderClick: (folder: string) => void;
  onNavigateUp: () => void;
  searchQuery?: string;
  filter?: "assignments" | "notes" | "past-papers";
}

export const FileBrowser: React.FC<FileBrowserProps> = ({
  path,
  onFolderClick,
  onNavigateUp,
  searchQuery = "",
  filter
}) => {
  // Function to get the current folder's contents based on the path
  const getCurrentFolder = (path: string[]): FolderType | null => {
    let current: FileOrFolder = sampleFiles;
    
    for (const folder of path) {
      if (current.type === "folder" && current.children && current.children[folder]) {
        current = current.children[folder];
      } else {
        return null;
      }
    }
    
    return current.type === "folder" ? current : null;
  };

  // Get current folder
  const currentFolder = useMemo(() => getCurrentFolder(path), [path]);
  
  // Function to filter items based on search query and filter type
  const filteredItems = useMemo(() => {
    if (!currentFolder) return [];

    // Convert the children object to array of entries [name, item]
    const items = Object.entries(currentFolder.children)
      .filter(([name, item]) => {
        // Filter by search query
        if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Filter by type if specified
        if (filter) {
          // For folder items, check if their name matches the filter
          if (item.type === "folder") {
            return filter === "assignments" && name.toLowerCase() === "assignments" ||
                   filter === "notes" && name.toLowerCase() === "notes" ||
                   filter === "past-papers" && name.toLowerCase().includes("past");
          }
          
          // For file items, rely on the parent path
          const lastPathSegment = path[path.length - 1].toLowerCase();
          return filter === "assignments" && lastPathSegment === "assignments" ||
                 filter === "notes" && lastPathSegment === "notes" ||
                 filter === "past-papers" && lastPathSegment.includes("past");
        }
        
        return true;
      });
      
    return items;
  }, [currentFolder, searchQuery, filter, path]);

  // Function to get the appropriate icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return <FileImage className="h-4 w-4" />;
      case "zip":
      case "rar":
        return <FileArchive className="h-4 w-4" />;
      case "doc":
      case "docx":
        return <FilePen className="h-4 w-4" />;
      case "ppt":
      case "pptx":
        return <FileCheck className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  if (!currentFolder) {
    return <div>Folder not found</div>;
  }

  return (
    <div className="space-y-4">
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
      
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(([name, item]) => (
            <Card 
              key={name} 
              className={`p-4 flex items-center cursor-pointer hover:bg-gray-50`}
              onClick={() => {
                if (item.type === "folder") {
                  onFolderClick(name);
                } else {
                  // Handle file click (e.g. preview)
                  console.log("Clicked file:", name);
                }
              }}
            >
              {item.type === "folder" ? (
                <FolderOpen className="h-5 w-5 mr-3 text-blue-500" />
              ) : (
                <div className="mr-3 text-amber-500">
                  {getFileIcon(item.fileType)}
                </div>
              )}
              <div>
                <p className="font-medium truncate">{name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type === "folder" ? "Folder" : item.fileType.toUpperCase()}
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
