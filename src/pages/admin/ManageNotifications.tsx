
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Bell, Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

type Notification = {
  id: string;
  title: string;
  description: string | null;
  created_at: string | null;
};

const notificationSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
});

const ManageNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Notification[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof notificationSchema>) => {
      const { data, error } = await supabase
        .from("notifications")
        .insert([
          {
            title: values.title,
            description: values.description,
          },
        ])
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Notification created",
        description: "The notification has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create notification: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof notificationSchema>) => {
      if (!editingNotification) throw new Error("No notification selected");
      
      const { data, error } = await supabase
        .from("notifications")
        .update({
          title: values.title,
          description: values.description,
        })
        .eq("id", editingNotification.id)
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Notification updated",
        description: "The notification has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      setIsOpen(false);
      setEditingNotification(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update notification: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Notification deleted",
        description: "The notification has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete notification: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (notification?: Notification) => {
    if (notification) {
      setEditingNotification(notification);
      form.setValue("title", notification.title);
      form.setValue("description", notification.description || "");
    } else {
      setEditingNotification(null);
      form.reset();
    }
    setIsOpen(true);
  };

  const onSubmit = (values: z.infer<typeof notificationSchema>) => {
    if (editingNotification) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manage Notifications</h1>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Add Notification
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Loading notifications...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{notification.description}</TableCell>
                    <TableCell>{formatDate(notification.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleOpenDialog(notification)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-500" 
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No notifications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingNotification ? "Edit" : "Create"} Notification
              </DialogTitle>
              <DialogDescription>
                {editingNotification
                  ? "Update the notification details below"
                  : "Fill in the information for the new notification"}
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
                        <Input placeholder="Notification title" {...field} />
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
                          placeholder="Description of the notification" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
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
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    {editingNotification ? "Update" : "Create"}
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

export default ManageNotifications;
