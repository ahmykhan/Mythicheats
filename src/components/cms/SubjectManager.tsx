
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  FolderPlus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown,
  Save,
  X,
  Plus
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

const SubjectManager = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editingSubfolder, setEditingSubfolder] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectLink, setNewSubjectLink] = useState("");
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const { toast } = useToast();

  // Load subjects from localStorage on component mount
  useEffect(() => {
    const savedSubjects = localStorage.getItem('cmsSubjects');
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  // Save subjects to localStorage whenever subjects change
  useEffect(() => {
    localStorage.setItem('cmsSubjects', JSON.stringify(subjects));
  }, [subjects]);

  const addSubject = () => {
    if (!newSubjectName.trim()) {
      toast({
        title: "Error",
        description: "Subject name is required",
        variant: "destructive"
      });
      return;
    }

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: newSubjectName,
      driveLink: newSubjectLink,
      subfolders: [],
      expanded: false
    };

    setSubjects([...subjects, newSubject]);
    setNewSubjectName("");
    setNewSubjectLink("");
    setIsAddingSubject(false);
    toast({
      title: "Success",
      description: "Subject added successfully"
    });
  };

  const updateSubject = (subjectId: string, name: string, driveLink: string) => {
    setSubjects(subjects.map(subject => 
      subject.id === subjectId 
        ? { ...subject, name, driveLink }
        : subject
    ));
    setEditingSubject(null);
    toast({
      title: "Success",
      description: "Subject updated successfully"
    });
  };

  const deleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter(subject => subject.id !== subjectId));
    toast({
      title: "Success",
      description: "Subject deleted successfully"
    });
  };

  const toggleSubjectExpansion = (subjectId: string) => {
    setSubjects(subjects.map(subject =>
      subject.id === subjectId
        ? { ...subject, expanded: !subject.expanded }
        : subject
    ));
  };

  const addSubfolder = (subjectId: string, name: string, driveLink: string) => {
    const newSubfolder: SubFolder = {
      id: Date.now().toString(),
      name,
      driveLink,
      parentId: subjectId
    };

    setSubjects(subjects.map(subject =>
      subject.id === subjectId
        ? { ...subject, subfolders: [...subject.subfolders, newSubfolder] }
        : subject
    ));

    toast({
      title: "Success",
      description: "Subfolder added successfully"
    });
  };

  const updateSubfolder = (subjectId: string, subfolderId: string, name: string, driveLink: string) => {
    setSubjects(subjects.map(subject =>
      subject.id === subjectId
        ? {
            ...subject,
            subfolders: subject.subfolders.map(subfolder =>
              subfolder.id === subfolderId
                ? { ...subfolder, name, driveLink }
                : subfolder
            )
          }
        : subject
    ));
    setEditingSubfolder(null);
    toast({
      title: "Success",
      description: "Subfolder updated successfully"
    });
  };

  const deleteSubfolder = (subjectId: string, subfolderId: string) => {
    setSubjects(subjects.map(subject =>
      subject.id === subjectId
        ? {
            ...subject,
            subfolders: subject.subfolders.filter(subfolder => subfolder.id !== subfolderId)
          }
        : subject
    ));
    toast({
      title: "Success",
      description: "Subfolder deleted successfully"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subject Management</h2>
        <Button 
          onClick={() => setIsAddingSubject(true)}
          className="glass-button"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Add Subject Form */}
      <AnimatePresence>
        {isAddingSubject && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Add New Subject
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingSubject(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subjectName">Subject Name</Label>
                  <Input
                    id="subjectName"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="Enter subject name"
                  />
                </div>
                <div>
                  <Label htmlFor="subjectLink">Google Drive Link</Label>
                  <Input
                    id="subjectLink"
                    value={newSubjectLink}
                    onChange={(e) => setNewSubjectLink(e.target.value)}
                    placeholder="Enter Google Drive folder link"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={addSubject} className="glass-button">
                    <Save className="mr-2 h-4 w-4" />
                    Save Subject
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingSubject(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subjects List */}
      <div className="space-y-4">
        <AnimatePresence>
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onUpdate={updateSubject}
              onDelete={deleteSubject}
              onToggleExpansion={toggleSubjectExpansion}
              onAddSubfolder={addSubfolder}
              onUpdateSubfolder={updateSubfolder}
              onDeleteSubfolder={deleteSubfolder}
              editingSubject={editingSubject}
              setEditingSubject={setEditingSubject}
              editingSubfolder={editingSubfolder}
              setEditingSubfolder={setEditingSubfolder}
            />
          ))}
        </AnimatePresence>
      </div>

      {subjects.length === 0 && (
        <Card className="glass-card text-center py-12">
          <CardContent>
            <FolderPlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subjects yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first subject to organize your course materials.
            </p>
            <Button onClick={() => setIsAddingSubject(true)} className="glass-button">
              Add First Subject
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface SubjectCardProps {
  subject: Subject;
  onUpdate: (id: string, name: string, driveLink: string) => void;
  onDelete: (id: string) => void;
  onToggleExpansion: (id: string) => void;
  onAddSubfolder: (subjectId: string, name: string, driveLink: string) => void;
  onUpdateSubfolder: (subjectId: string, subfolderId: string, name: string, driveLink: string) => void;
  onDeleteSubfolder: (subjectId: string, subfolderId: string) => void;
  editingSubject: string | null;
  setEditingSubject: (id: string | null) => void;
  editingSubfolder: string | null;
  setEditingSubfolder: (id: string | null) => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  onUpdate,
  onDelete,
  onToggleExpansion,
  onAddSubfolder,
  onUpdateSubfolder,
  onDeleteSubfolder,
  editingSubject,
  setEditingSubject,
  editingSubfolder,
  setEditingSubfolder
}) => {
  const [editName, setEditName] = useState(subject.name);
  const [editLink, setEditLink] = useState(subject.driveLink);
  const [newSubfolderName, setNewSubfolderName] = useState("");
  const [newSubfolderLink, setNewSubfolderLink] = useState("");
  const [showAddSubfolder, setShowAddSubfolder] = useState(false);

  const handleSave = () => {
    onUpdate(subject.id, editName, editLink);
  };

  const handleAddSubfolder = () => {
    if (newSubfolderName.trim()) {
      onAddSubfolder(subject.id, newSubfolderName, newSubfolderLink);
      setNewSubfolderName("");
      setNewSubfolderLink("");
      setShowAddSubfolder(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="glass-card hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpansion(subject.id)}
                className="p-1"
              >
                {subject.expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              
              {editingSubject === subject.id ? (
                <div className="flex items-center space-x-2 flex-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleSave} className="glass-button">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingSubject(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{subject.name}</h3>
                  <Badge variant="secondary">
                    {subject.subfolders.length} subfolders
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {subject.driveLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(subject.driveLink, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSubject(subject.id)}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(subject.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {editingSubject === subject.id && (
            <div className="mt-4">
              <Label htmlFor="editLink">Google Drive Link</Label>
              <Input
                id="editLink"
                value={editLink}
                onChange={(e) => setEditLink(e.target.value)}
                placeholder="Enter Google Drive folder link"
              />
            </div>
          )}
        </CardHeader>

        <AnimatePresence>
          {subject.expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Subfolders</h4>
                  <Button
                    size="sm"
                    onClick={() => setShowAddSubfolder(!showAddSubfolder)}
                    className="glass-button"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Subfolder
                  </Button>
                </div>

                {showAddSubfolder && (
                  <Card className="mb-4 bg-muted/20">
                    <CardContent className="pt-4 space-y-3">
                      <Input
                        placeholder="Subfolder name"
                        value={newSubfolderName}
                        onChange={(e) => setNewSubfolderName(e.target.value)}
                      />
                      <Input
                        placeholder="Google Drive link"
                        value={newSubfolderLink}
                        onChange={(e) => setNewSubfolderLink(e.target.value)}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={handleAddSubfolder}>
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowAddSubfolder(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  {subject.subfolders.map((subfolder) => (
                    <SubfolderItem
                      key={subfolder.id}
                      subfolder={subfolder}
                      subjectId={subject.id}
                      onUpdate={onUpdateSubfolder}
                      onDelete={onDeleteSubfolder}
                      editingSubfolder={editingSubfolder}
                      setEditingSubfolder={setEditingSubfolder}
                    />
                  ))}
                  
                  {subject.subfolders.length === 0 && !showAddSubfolder && (
                    <p className="text-muted-foreground text-sm italic">
                      No subfolders yet. Click "Add Subfolder" to create one.
                    </p>
                  )}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

interface SubfolderItemProps {
  subfolder: SubFolder;
  subjectId: string;
  onUpdate: (subjectId: string, subfolderId: string, name: string, driveLink: string) => void;
  onDelete: (subjectId: string, subfolderId: string) => void;
  editingSubfolder: string | null;
  setEditingSubfolder: (id: string | null) => void;
}

const SubfolderItem: React.FC<SubfolderItemProps> = ({
  subfolder,
  subjectId,
  onUpdate,
  onDelete,
  editingSubfolder,
  setEditingSubfolder
}) => {
  const [editName, setEditName] = useState(subfolder.name);
  const [editLink, setEditLink] = useState(subfolder.driveLink);

  const handleSave = () => {
    onUpdate(subjectId, subfolder.id, editName, editLink);
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      {editingSubfolder === subfolder.id ? (
        <div className="flex items-center space-x-2 flex-1">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1"
            size={32}
          />
          <Input
            value={editLink}
            onChange={(e) => setEditLink(e.target.value)}
            placeholder="Drive link"
            className="flex-1"
          />
          <Button size="sm" onClick={handleSave}>
            <Save className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setEditingSubfolder(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-2">
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{subfolder.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            {subfolder.driveLink && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(subfolder.driveLink, '_blank')}
                className="p-1"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingSubfolder(subfolder.id)}
              className="p-1"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(subjectId, subfolder.id)}
              className="p-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SubjectManager;
