
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    enableUserRegistration: true,
    enableNotifications: true,
    enableCourseAccess: true,
    darkMode: false,
  });

  const handleSaveSettings = () => {
    // In a real app, this would save to a database
    toast({
      title: "Settings saved",
      description: "Your settings have been successfully updated.",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Settings</h1>
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>
              Configure the core features of your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="user-registration" className="flex flex-col space-y-1">
                <span>User Registration</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Allow new users to register on the platform
                </span>
              </Label>
              <Switch
                id="user-registration"
                checked={settings.enableUserRegistration}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableUserRegistration: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="notifications" className="flex flex-col space-y-1">
                <span>Notifications</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Enable system notifications for all users
                </span>
              </Label>
              <Switch
                id="notifications"
                checked={settings.enableNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableNotifications: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="course-access" className="flex flex-col space-y-1">
                <span>Course Access</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Allow users to access all courses by default
                </span>
              </Label>
              <Switch
                id="course-access"
                checked={settings.enableCourseAccess}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableCourseAccess: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                <span>Dark Mode</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Enable dark mode for the admin interface
                </span>
              </Label>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, darkMode: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
