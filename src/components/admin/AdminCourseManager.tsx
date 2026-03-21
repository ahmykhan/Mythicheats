
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface Course {
  id: string;
  title: string;
  description: string | null;
  is_locked: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const AdminCourseManager: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshContent = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
    toast({
      title: "Courses Refreshed",
      description: "Latest courses loaded successfully"
    });
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const { error } = await supabase
        .from("courses")
        .insert({
          title: newTitle,
          description: newDescription || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course added successfully"
      });

      setNewTitle("");
      setNewDescription("");
      setShowAddForm(false);
      fetchCourses();
    } catch (error) {
      console.error("Error adding course:", error);
      toast({
        title: "Error",
        description: "Failed to add course",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !newTitle.trim()) return;

    try {
      const { error } = await supabase
        .from("courses")
        .update({
          title: newTitle,
          description: newDescription || null
        })
        .eq("id", editingCourse.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course updated successfully"
      });

      setEditingCourse(null);
      setNewTitle("");
      setNewDescription("");
      fetchCourses();
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course deleted successfully"
      });

      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive"
      });
    }
  };

  const toggleCourseLock = async (course: Course) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update({ is_locked: !course.is_locked })
        .eq("id", course.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Course ${course.is_locked ? 'unlocked' : 'locked'} successfully`
      });

      fetchCourses();
    } catch (error) {
      console.error("Error toggling course lock:", error);
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive"
      });
    }
  };

  const startEdit = (course: Course) => {
    setEditingCourse(course);
    setNewTitle(course.title);
    setNewDescription(course.description || "");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Course Management
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={refreshContent}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingCourse) && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingCourse ? "Edit Course" : "Add New Course"}
          </h2>
          <form onSubmit={editingCourse ? handleUpdateCourse : handleAddCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Course title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Course description"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingCourse ? "Update" : "Add"} Course
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCourse(null);
                  setNewTitle("");
                  setNewDescription("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`p-4 ${course.is_locked ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{course.title}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(course)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCourse(course.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {course.description && (
                <p className="text-gray-600 text-sm mb-3">{course.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Created {course.created_at ? new Date(course.created_at).toLocaleDateString() : 'N/A'}
                </span>
                <Button
                  variant={course.is_locked ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCourseLock(course)}
                >
                  {course.is_locked ? "Unlock" : "Lock"}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {courses.length === 0 && (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No courses created yet</p>
        </Card>
      )}
    </div>
  );
};

export default AdminCourseManager;
