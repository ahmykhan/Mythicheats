
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeSelector from "@/components/theme/ThemeSelector";
import EnhancedBackground from "@/components/background/EnhancedBackground";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageNotifications from "./pages/admin/ManageNotifications";
import AdminSettings from "./pages/admin/AdminSettings";
import ManageCourses from "./pages/admin/ManageCourses";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <div className="relative min-h-screen">
        <EnhancedBackground />
        <div className="relative z-10">
          <ThemeSelector />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notifications" element={<Notifications />} />
              
              {/* Protected Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/courses" element={
                <ProtectedRoute>
                  <ManageCourses />
                </ProtectedRoute>
              } />
              <Route path="/admin/notifications" element={
                <ProtectedRoute>
                  <ManageNotifications />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
