
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeSelector from "@/components/theme/ThemeSelector";
import EnhancedBackground from "@/components/background/EnhancedBackground";
import PWAApp from "@/components/PWAApp";

// Admin pages (kept for admin functionality)
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageNotifications from "./pages/admin/ManageNotifications";
import AdminSettings from "./pages/admin/AdminSettings";
import ManageCourses from "./pages/admin/ManageCourses";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, //  5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    },
  },
});

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
              {/* Main PWA route */}
              <Route path="/" element={<PWAApp />} />
              <Route path="/pwa" element={<PWAApp />} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<Login />} />
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
              
              {/* Fallback to main app */}
              <Route path="*" element={<PWAApp />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
