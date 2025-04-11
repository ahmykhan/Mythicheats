
import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronRight,
  File,
  FileText,
  FolderClosed,
  FolderOpen,
  Plus,
  Search,
  Upload,
  FileArchive,
  FileImage
} from "lucide-react";
import { FileBrowser } from "@/components/files/FileBrowser";

const CourseFiles = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createItemType, setCreateItemType] = useState<"folder" | "file">("folder");
  const [newItemName, setNewItemName] = useState("");
  const [currentPath, setCurrentPath] = useState<string[]>(["Courses"]);
  const [searchQuery, setSearchQuery] = useState("");

  // Function to handle folder creation or file upload
  const handleCreateItem = () => {
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid name",
        variant: "destructive",
      });
      return;
    }

    const itemType = createItemType === "folder" ? "folder" : "file";
    toast({
      title: `${itemType} Created`,
      description: `${itemType === "folder" ? "Folder" : "File"} "${newItemName}" has been created in ${currentPath.join("/")}`,
    });
    
    setNewItemName("");
    setIsCreateDialogOpen(false);
  };

  // Handle navigation to a folder
  const navigateToFolder = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  // Navigate up one level
  const navigateUp = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  // Navigate to specific path level
  const navigateToPath = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Course Files</h1>
            <Breadcrumb>
              {currentPath.map((part, index) => (
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink 
                    onClick={() => navigateToPath(index)}
                    className="cursor-pointer"
                  >
                    {part}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => {
              setCreateItemType("folder");
              setIsCreateDialogOpen(true);
            }}>
              <FolderClosed className="mr-2 h-4 w-4" />
              New Folder
            </Button>
            <Button onClick={() => {
              setCreateItemType("file");
              setIsCreateDialogOpen(true);
            }}>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="past-papers">Past Papers</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <FileBrowser 
              path={currentPath} 
              onFolderClick={navigateToFolder} 
              onNavigateUp={navigateUp}
              searchQuery={searchQuery}
            />
          </TabsContent>
          <TabsContent value="assignments" className="mt-4">
            <FileBrowser 
              path={currentPath} 
              onFolderClick={navigateToFolder} 
              onNavigateUp={navigateUp}
              searchQuery={searchQuery}
              filter="assignments"
            />
          </TabsContent>
          <TabsContent value="notes" className="mt-4">
            <FileBrowser 
              path={currentPath} 
              onFolderClick={navigateToFolder} 
              onNavigateUp={navigateUp}
              searchQuery={searchQuery}
              filter="notes"
            />
          </TabsContent>
          <TabsContent value="past-papers" className="mt-4">
            <FileBrowser 
              path={currentPath} 
              onFolderClick={navigateToFolder} 
              onNavigateUp={navigateUp}
              searchQuery={searchQuery}
              filter="past-papers"
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialog for creating a new folder or uploading a file */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {createItemType === "folder" ? "Create New Folder" : "Upload File"}
            </DialogTitle>
            <DialogDescription>
              {createItemType === "folder" 
                ? "Enter a name for the new folder" 
                : "Select a file to upload and give it a name"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Input
                placeholder={createItemType === "folder" ? "Folder name" : "File name"}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            {createItemType === "file" && (
              <div>
                <Input type="file" />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem}>
              {createItemType === "folder" ? "Create Folder" : "Upload File"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CourseFiles;
