
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bell,
  BookOpen,
  LogOut,
  Menu,
  Shield,
  Settings,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <header className="bg-white border-b fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-4"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
        </header>
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isMobile
            ? `fixed top-16 left-0 z-40 transform ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "fixed top-0 left-0 z-40"
        } w-64 h-full bg-white border-r transition-transform duration-200 ease-in-out`}
      >
        {!isMobile && (
          <div className="h-16 flex items-center px-6 border-b">
            <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
          </div>
        )}

        <nav className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/admin")}
          >
            <Shield className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/admin/courses")}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Manage Courses
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/admin/notifications")}
          >
            <Bell className="mr-2 h-4 w-4" />
            Manage Notifications
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/admin/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`${
          isMobile ? "mt-16" : ""
        } transition-all duration-200 ease-in-out ${
          isMobile ? "ml-0" : "ml-64"
        }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
