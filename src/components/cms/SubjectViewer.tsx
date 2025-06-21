
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GoogleDriveIframe from "@/components/drive/GoogleDriveIframe";
import { 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink,
  BookOpen
} from "lucide-react";

interface SubFolder {
  id: string;
  name: string;
  driveLink: string;
  parentId: string;
}

interface Subject {
  id: string;
  name: string;
  driveLink: string;
  subfolders: SubFolder[];
  expanded?: boolean;
}

interface SubjectViewerProps {
  isAdmin?: boolean;
}

const SubjectViewer: React.FC<SubjectViewerProps> = ({ isAdmin = false }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<{
    id: string;
    name: string;
    driveLink: string;
    type: 'subject' | 'subfolder';
  } | null>(null);

  // Load subjects from localStorage
  useEffect(() => {
    const savedSubjects = localStorage.getItem('cmsSubjects');
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  const toggleSubjectExpansion = (subjectId: string) => {
    setSubjects(subjects.map(subject =>
      subject.id === subjectId
        ? { ...subject, expanded: !subject.expanded }
        : subject
    ));
  };

  const extractFolderId = (driveLink: string): string => {
    if (!driveLink) return '';
    
    // Handle different Google Drive URL formats
    const patterns = [
      /\/folders\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/,
      /^([a-zA-Z0-9-_]+)$/
    ];
    
    for (const pattern of patterns) {
      const match = driveLink.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return driveLink;
  };

  const handleFolderSelect = (id: string, name: string, driveLink: string, type: 'subject' | 'subfolder') => {
    setSelectedFolder({ id, name, driveLink, type });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Sidebar with subjects hierarchy */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Course Materials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {subjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No subjects available</p>
                {isAdmin && (
                  <p className="text-sm mt-2">
                    Use the Subject Manager to add content
                  </p>
                )}
              </div>
            ) : (
              subjects.map((subject) => (
                <div key={subject.id} className="space-y-1">
                  <div 
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedFolder?.id === subject.id && selectedFolder?.type === 'subject'
                        ? 'bg-primary/20 border border-primary/30'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleFolderSelect(subject.id, subject.name, subject.driveLink, 'subject')}
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSubjectExpansion(subject.id);
                        }}
                        className="p-1 h-6 w-6"
                      >
                        {subject.expanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                      <FolderOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium truncate">{subject.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {subject.subfolders.length}
                    </Badge>
                  </div>

                  <AnimatePresence>
                    {subject.expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-8 space-y-1"
                      >
                        {subject.subfolders.map((subfolder) => (
                          <div
                            key={subfolder.id}
                            className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedFolder?.id === subfolder.id && selectedFolder?.type === 'subfolder'
                                ? 'bg-primary/20 border border-primary/30'
                                : 'hover:bg-muted/30'
                            }`}
                            onClick={() => handleFolderSelect(subfolder.id, subfolder.name, subfolder.driveLink, 'subfolder')}
                          >
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <FolderOpen className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm truncate">{subfolder.name}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main content area */}
      <div className="lg:col-span-2">
        {selectedFolder ? (
          <Card className="glass-card h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FolderOpen className="mr-2 h-5 w-5" />
                  {selectedFolder.name}
                </CardTitle>
                {selectedFolder.driveLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedFolder.driveLink, '_blank')}
                    className="glass-button"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Drive
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {selectedFolder.driveLink ? (
                <div className="h-96 lg:h-[600px]">
                  <GoogleDriveIframe 
                    folderId={extractFolderId(selectedFolder.driveLink)}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                  <div className="text-center">
                    <FolderOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No Google Drive link configured</p>
                    {isAdmin && (
                      <p className="text-sm mt-2">
                        Configure the drive link in Subject Manager
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card h-full">
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a Subject</h3>
                <p>Choose a subject or subfolder from the sidebar to view its contents</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SubjectViewer;
