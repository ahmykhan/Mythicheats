
import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
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
  FolderClosed,
  Search,
  ExternalLink,
} from "lucide-react";
import { FileBrowser } from "@/components/files/FileBrowser";
import { parseGoogleDriveId, getGoogleDriveFileLink } from "@/services/googleDriveService";
import { GoogleDriveAuthButton } from "@/components/files/GoogleDriveAuthButton";

interface PathItem {
  name: string;
  id: string;
}

// Google Drive folder ID from the link you provided
const MAIN_FOLDER_ID = "1ubFSKvzW_pprfsMcAKDofmGrPPNkW92e";

const CourseFiles = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPath, setCurrentPath] = useState<PathItem[]>([
    { name: "IICT Files", id: MAIN_FOLDER_ID }
  ]);
  const [activeTab, setActiveTab] = useState<string>("all");

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
    return currentPath[currentPath.length - 1]?.id || MAIN_FOLDER_ID;
  };

  const openGoogleDriveFolder = () => {
    const folderId = getCurrentFolderId();
    window.open(getGoogleDriveFileLink(folderId, "application/vnd.google-apps.folder"), "_blank");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Course Files</h1>
            <div className="flex flex-wrap items-center gap-1 mt-1">
              {currentPath.map((pathItem, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <span className="mx-1 text-gray-400">/</span>}
                  <button 
                    onClick={() => navigateToPath(index)}
                    className={`text-sm hover:underline ${
                      index === currentPath.length - 1 
                        ? 'font-medium text-primary'
                        : 'text-gray-600'
                    }`}
                  >
                    {pathItem.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <GoogleDriveAuthButton />
            
            <Button onClick={openGoogleDriveFolder} variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Open in Google Drive</span>
              <span className="sm:hidden">Drive</span>
            </Button>
          </div>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <div className="p-4 border-b">
              <TabsList className="w-full justify-start gap-2">
                <TabsTrigger value="all" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">All Files</TabsTrigger>
                <TabsTrigger value="assignments" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Assignments</TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Notes</TabsTrigger>
                <TabsTrigger value="past-papers" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Past Papers</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-4">
              <TabsContent value="all">
                <FileBrowser 
                  path={currentPath.map(p => p.name)}
                  onFolderClick={navigateToFolder}
                  onNavigateUp={navigateUp}
                  searchQuery={searchQuery}
                  currentFolderId={getCurrentFolderId()}
                />
              </TabsContent>
              <TabsContent value="assignments">
                <FileBrowser 
                  path={currentPath.map(p => p.name)}
                  onFolderClick={navigateToFolder}
                  onNavigateUp={navigateUp}
                  searchQuery={searchQuery}
                  filter="assignments"
                  currentFolderId={getCurrentFolderId()}
                />
              </TabsContent>
              <TabsContent value="notes">
                <FileBrowser 
                  path={currentPath.map(p => p.name)}
                  onFolderClick={navigateToFolder}
                  onNavigateUp={navigateUp}
                  searchQuery={searchQuery}
                  filter="notes"
                  currentFolderId={getCurrentFolderId()}
                />
              </TabsContent>
              <TabsContent value="past-papers">
                <FileBrowser 
                  path={currentPath.map(p => p.name)}
                  onFolderClick={navigateToFolder}
                  onNavigateUp={navigateUp}
                  searchQuery={searchQuery}
                  filter="past-papers"
                  currentFolderId={getCurrentFolderId()}
                />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CourseFiles;
