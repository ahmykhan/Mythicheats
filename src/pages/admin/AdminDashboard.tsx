
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Bell, BookOpen, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: notificationsCount } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true });
      
      if (error) {
        console.error("Error fetching notifications count:", error);
        return 0;
      }
      
      return count || 0;
    },
  });

  const statCards = [
    {
      title: "Courses",
      value: "2", // This would come from a database query in a real app
      description: "Total courses in the system",
      icon: <BookOpen className="h-8 w-8 text-blue-500" />,
      linkTo: "/admin/courses"
    },
    {
      title: "Notifications",
      value: notificationsCount?.toString() || "0",
      description: "Total notifications sent",
      icon: <Bell className="h-8 w-8 text-amber-500" />,
      linkTo: "/admin/notifications"
    },
    {
      title: "Users",
      value: "15", // This would come from a database query in a real app
      description: "Registered users",
      icon: <Users className="h-8 w-8 text-green-500" />,
      linkTo: "/admin/users"
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <Card key={card.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{card.title}</CardTitle>
                  {card.icon}
                </div>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{card.value}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => navigate(card.linkTo)}>
                  Manage {card.title}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
