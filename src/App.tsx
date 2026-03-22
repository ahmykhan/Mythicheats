
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";

import EnhancedBackground from "@/components/background/EnhancedBackground";
import PWAApp from "@/components/PWAApp";
import ResetPassword from "@/pages/ResetPassword";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, //  5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <div className="relative min-h-screen">
        <EnhancedBackground />
        <div className="relative z-10">
          
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* Single main route for the PWA app */}
              <Route path="/*" element={<PWAApp />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
