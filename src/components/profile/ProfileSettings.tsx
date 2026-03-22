
import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import ThemeSelector from "../theme/ThemeSelector";

interface ProfileSettingsProps {
  username: string;
  userEmail: string;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ username, userEmail }) => {
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
            <Input value={userEmail} disabled className="bg-muted" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <Input value={username} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground mt-1">
              Username is automatically generated and cannot be changed.
            </p>
          </div>
        </div>
      </Card>

      {/* Theme Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Theme Settings</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Choose your preferred theme.
        </p>
        <ThemeSelector />
      </Card>

      {/* App Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">App Information</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Platform:</strong> Progressive Web App (PWA)</p>
          <p><strong>Features:</strong> Study Materials, Global Chat, Push Notifications</p>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSettings;
