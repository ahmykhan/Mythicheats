
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Plus, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  description: string | null;
  created_at: string | null;
}

interface NotificationCenterProps {
  isAdmin: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isAdmin }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .insert({
          title: newTitle,
          description: newDescription || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification added successfully"
      });

      setNewTitle("");
      setNewDescription("");
      setShowAddForm(false);
      fetchNotifications();
    } catch (error) {
      console.error("Error adding notification:", error);
      toast({
        title: "Error",
        description: "Failed to add notification",
        variant: "destructive"
      });
    }
  };

  const handleUpdateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotification || !newTitle.trim()) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          title: newTitle,
          description: newDescription || null
        })
        .eq("id", editingNotification.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification updated successfully"
      });

      setEditingNotification(null);
      setNewTitle("");
      setNewDescription("");
      fetchNotifications();
    } catch (error) {
      console.error("Error updating notification:", error);
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification deleted successfully"
      });

      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
    }
  };

  const startEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setNewTitle(notification.title);
    setNewDescription(notification.description || "");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleString();
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
          <Bell className="h-6 w-6" />
          Notifications
        </h1>
        {isAdmin && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Notification
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingNotification) && isAdmin && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingNotification ? "Edit Notification" : "Add New Notification"}
          </h2>
          <form onSubmit={editingNotification ? handleUpdateNotification : handleAddNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Notification title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Notification description"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingNotification ? "Update" : "Add"} Notification
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingNotification(null);
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

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{notification.title}</h3>
                  {notification.description && (
                    <p className="text-gray-600 mt-2">{notification.description}</p>
                  )}
                  <p className="text-sm text-gray-400 mt-2">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(notification)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card className="p-8 text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No notifications available</p>
        </Card>
      )}
    </div>
  );
};

export default NotificationCenter;
