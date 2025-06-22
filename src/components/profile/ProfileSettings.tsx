
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Save } from "lucide-react";
import ThemeSelector from "../theme/ThemeSelector";

interface ProfileSettingsProps {
  username: string;
  userEmail: string;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ username, userEmail }) => {
  const [newUsername, setNewUsername] = useState(username);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || newUsername === username) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from("usernames")
        .select("username")
        .eq("username", newUsername.trim())
        .neq("user_id", user.id)
        .single();

      if (existingUser) {
        toast({
          title: "Username taken",
          description: "This username is already in use. Please choose another.",
          variant: "destructive"
        });
        return;
      }

      // Update username
      const { error } = await supabase
        .from("usernames")
        .update({ username: newUsername.trim() })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Username updated successfully"
      });

      // Refresh the page to update the username everywhere
      window.location.reload();
    } catch (error) {
      console.error("Error updating username:", error);
      toast({
        title: "Error",
        description: "Failed to update username",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <User className="h-6 w-6" />
        Profile Settings
      </h1>

      {/* Profile Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input value={userEmail} disabled className="bg-gray-100" />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          
          <form onSubmit={handleUpdateUsername}>
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <div className="flex gap-2">
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  minLength={3}
                  maxLength={20}
                />
                <Button
                  type="submit"
                  disabled={loading || !newUsername.trim() || newUsername === username}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Username must be 3-20 characters long
              </p>
            </div>
          </form>
        </div>
      </Card>

      {/* Theme Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Theme Settings</h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose your preferred theme. The theme selector is available in the top-right corner.
        </p>
        <div className="flex justify-center">
          <ThemeSelector />
        </div>
      </Card>

      {/* App Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">App Information</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Platform:</strong> Progressive Web App (PWA)</p>
          <p><strong>Features:</strong> Study Materials, Global Chat, Push Notifications</p>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSettings;
