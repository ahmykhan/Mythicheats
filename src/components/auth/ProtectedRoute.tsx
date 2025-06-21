
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

const ADMIN_EMAIL = "furyboy4592@gmail.com";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user?.email) {
          setUserEmail(data.session.user.email);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 glass-card">
          <p>Loading...</p>
        </Card>
      </div>
    );
  }

  if (!userEmail || userEmail !== ADMIN_EMAIL) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
