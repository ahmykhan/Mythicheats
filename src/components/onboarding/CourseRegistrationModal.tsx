import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface CourseRegistrationModalProps {
  open: boolean;
  onComplete: () => void;
}

const CourseRegistrationModal: React.FC<CourseRegistrationModalProps> = ({ open, onComplete }) => {
  const [sections, setSections] = useState<{ id: string; name: string }[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  const fetchData = async () => {
    setFetching(true);
    const [sectionsRes, coursesRes] = await Promise.all([
      supabase.from("valid_sections").select("id, name").order("name"),
      supabase.from("valid_courses").select("id, name").order("name"),
    ]);
    setSections(sectionsRes.data || []);
    setCourses(coursesRes.data || []);
    setFetching(false);
  };

  const toggleCourse = (courseName: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseName)
        ? prev.filter((c) => c !== courseName)
        : [...prev, courseName]
    );
  };

  const handleSubmit = async () => {
    if (!selectedSection) {
      toast({ title: "Select a section", variant: "destructive" });
      return;
    }
    if (selectedCourses.length === 0) {
      toast({ title: "Select at least one course", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Find or create section room
      const sectionRoomName = `Section: ${selectedSection}`;
      let { data: sectionRoom } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("name", sectionRoomName)
        .eq("type", "section")
        .maybeSingle();

      if (!sectionRoom) {
        const { data: created, error } = await supabase
          .from("chat_rooms")
          .insert({ name: sectionRoomName, type: "section", created_by: user.id })
          .select("id")
          .single();
        if (error) throw error;
        sectionRoom = created;
      }

      // Join section room
      await supabase
        .from("room_participants")
        .upsert({ room_id: sectionRoom!.id, user_id: user.id, role: "member" }, { onConflict: "room_id,user_id" });

      // 2. Find or create course rooms and join them
      for (const courseName of selectedCourses) {
        const courseRoomName = `Course: ${courseName}`;
        let { data: courseRoom } = await supabase
          .from("chat_rooms")
          .select("id")
          .eq("name", courseRoomName)
          .eq("type", "course")
          .maybeSingle();

        if (!courseRoom) {
          const { data: created, error } = await supabase
            .from("chat_rooms")
            .insert({ name: courseRoomName, type: "course", created_by: user.id })
            .select("id")
            .single();
          if (error) throw error;
          courseRoom = created;
        }

        await supabase
          .from("room_participants")
          .upsert({ room_id: courseRoom!.id, user_id: user.id, role: "member" }, { onConflict: "room_id,user_id" });
      }

      // 3. Update user profile
      const { error: updateError } = await supabase
        .from("usernames")
        .update({
          has_registered_courses: true,
          section: selectedSection,
          enrolled_courses: selectedCourses,
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast({ title: "Registration complete!", description: "You've been added to your section and course groups." });
      onComplete();
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Complete Your Registration</DialogTitle>
          <DialogDescription>
            Select your section and courses to join the relevant chat groups.
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Section Dropdown */}
            <div>
              <label className="text-sm font-medium mb-2 block">Section</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sections.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">No sections available yet. Contact your admin.</p>
              )}
            </div>

            {/* Courses Multi-select */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Courses ({selectedCourses.length} selected)
              </label>
              <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
                {courses.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No courses available yet. Contact your admin.</p>
                ) : (
                  courses.map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <Checkbox
                        id={c.id}
                        checked={selectedCourses.includes(c.name)}
                        onCheckedChange={() => toggleCourse(c.name)}
                      />
                      <label htmlFor={c.id} className="text-sm cursor-pointer flex-1">
                        {c.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !selectedSection || selectedCourses.length === 0}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Registering...
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CourseRegistrationModal;
