
import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { BookOpen, Lock, Pencil, Plus, Trash2, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

type Course = {
  id: number;
  title: string;
  description: string;
  filesCount: number;
  isLocked: boolean;
};

// Sample data - In a real app, this would come from a database
const sampleCourses: Course[] = [
  {
    id: 1,
    title: "Mathematics",
    description: "Advanced calculus and algebra",
    filesCount: 5,
    isLocked: false,
  },
  {
    id: 2,
    title: "Physics",
    description: "Mechanics and thermodynamics",
    filesCount: 3,
    isLocked: true,
  },
];

const courseSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  filesCount: z.coerce.number().min(0, { message: "Files count must be 0 or more" }).default(0),
  isLocked: z.boolean().default(false),
});

type CourseFormValues = z.infer<typeof courseSchema>;

const ManageCourses = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const { toast } = useToast();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      filesCount: 0,
      isLocked: false,
    },
  });

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      form.setValue("title", course.title);
      form.setValue("description", course.description);
      form.setValue("filesCount", course.filesCount);
      form.setValue("isLocked", course.isLocked);
    } else {
      setEditingCourse(null);
      form.reset();
    }
    setIsOpen(true);
  };

  const onSubmit = (values: CourseFormValues) => {
    if (editingCourse) {
      // Update existing course
      setCourses(
        courses.map((course) =>
          course.id === editingCourse.id
            ? { ...course, ...values }
            : course
        )
      );
      toast({
        title: "Course updated",
        description: "The course has been successfully updated.",
      });
    } else {
      // Create new course with all required fields
      const newCourse: Course = {
        id: Math.max(0, ...courses.map((c) => c.id)) + 1,
        title: values.title,
        description: values.description,
        filesCount: values.filesCount,
        isLocked: values.isLocked,
      };
      setCourses([...courses, newCourse]);
      toast({
        title: "Course created",
        description: "The course has been successfully created.",
      });
    }
    setIsOpen(false);
    form.reset();
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this course?")) {
      setCourses(courses.filter((course) => course.id !== id));
      toast({
        title: "Course deleted",
        description: "The course has been successfully deleted.",
      });
    }
  };

  const toggleLock = (id: number) => {
    setCourses(
      courses.map((course) =>
        course.id === id
          ? { ...course, isLocked: !course.isLocked }
          : course
      )
    );
    toast({
      title: "Course updated",
      description: `The course has been ${
        courses.find((c) => c.id === id)?.isLocked ? "unlocked" : "locked"
      }.`,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manage Courses</h1>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Files</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length > 0 ? (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{course.description}</TableCell>
                  <TableCell>{course.filesCount}</TableCell>
                  <TableCell>
                    {course.isLocked ? (
                      <span className="inline-flex items-center text-amber-600">
                        <Lock className="h-4 w-4 mr-1" /> Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-green-600">
                        <Unlock className="h-4 w-4 mr-1" /> Unlocked
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleLock(course.id)}
                      >
                        {course.isLocked ? "Unlock" : "Lock"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleOpenDialog(course)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-500" 
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No courses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? "Edit" : "Create"} Course
              </DialogTitle>
              <DialogDescription>
                {editingCourse
                  ? "Update the course details below"
                  : "Fill in the information for the new course"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Course title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description of the course" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="filesCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Files</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isLocked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Lock Course</FormLabel>
                        <FormDescription>
                          This will restrict access to the course for users.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {editingCourse ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ManageCourses;
