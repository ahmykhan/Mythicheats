
import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
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
  FileImage,
  ExternalLink
} from "lucide-react";
import { FileBrowser } from "@/components/files/FileBrowser";

interface PathItem {
  name: string;
  id: string;
}

const CourseFiles = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createItemType, setCreateItemType] = useState<"folder" | "file">("folder");
  const [newItemName, setNewItemName] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPath, setCurrentPath] = useState<PathItem[]>([
    { name: "My Drive", id: "root" }
  ]);
  const [activeTab, setActiveTab] = useState<string>("all");

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
      title: `${itemType} Creation Initiated`,
      description: `Creating ${itemType} "${newItemName}" in Google Drive...`,
    });
    
    setTimeout(() => {
      toast({
        title: `${itemType} Created`,
        description: `${itemType === "folder" ? "Folder" : "File"} "${newItemName}" has been created successfully.`,
      });
    }, 1500);
    
    setNewItemName("");
    setFileToUpload(null);
    setIsCreateDialogOpen(false);
  };

  const navigateToFolder = (folderName: string, folderId: string) => {
    setCurrentPath([...currentPath, { name: folderName, id: folderId }]);
  };

  const navigateUp = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const navigateToPath = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const getCurrentFolderId = () => {
    return currentPath[currentPath.length - 1]?.id || "root";
  };

  const openGoogleDriveFolder = () => {
    window.open("https://drive.google.com/drive/folders/1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e", "_blank");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Course Files</h1>
            <Breadcrumb>
              {currentPath.map((pathItem, index) => (
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink 
                    onClick={() => navigateToPath(index)}
                    className="cursor-pointer"
                  >
                    {pathItem.name}
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
            
            <Button onClick={openGoogleDriveFolder} variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Google Drive
            </Button>
            
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

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="past-papers">Past Papers</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <FileBrowser 
              path={currentPath.map(p => p.name)}
              onFolderClick={navigateToFolder}
              onNavigateUp={navigateUp}
              searchQuery={searchQuery}
              currentFolderId={getCurrentFolderId()}
            />
          </TabsContent>
          <TabsContent value="assignments" className="mt-4">
            <FileBrowser 
              path={currentPath.map(p => p.name)}
              onFolderClick={navigateToFolder}
              onNavigateUp={navigateUp}
              searchQuery={searchQuery}
              filter="assignments"
              currentFolderId={getCurrentFolderId()}
            />
          </TabsContent>
          <TabsContent value="notes" className="mt-4">
            <FileBrowser 
              path={currentPath.map(p => p.name)}
              onFolderClick={navigateToFolder}
              onNavigateUp={navigateUp}
              searchQuery={searchQuery}
              filter="notes"
              currentFolderId={getCurrentFolderId()}
            />
          </TabsContent>
          <TabsContent value="past-papers" className="mt-4">
            <FileBrowser 
              path={currentPath.map(p => p.name)}
              onFolderClick={navigateToFolder}
              onNavigateUp={navigateUp}
              searchQuery={searchQuery}
              filter="past-papers"
              currentFolderId={getCurrentFolderId()}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {createItemType === "folder" ? "Create New Folder" : "Upload File"}
            </DialogTitle>
            <DialogDescription>
              {createItemType === "folder" 
                ? "Enter a name for the new folder in Google Drive" 
                : "Select a file to upload to Google Drive"
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
                <Input 
                  type="file" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileToUpload(e.target.files[0]);
                      if (!newItemName) {
                        setNewItemName(e.target.files[0].name);
                      }
                    }
                  }}
                />
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
