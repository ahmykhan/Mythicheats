import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Lock, FileText } from "lucide-react";

const Dashboard = () => {
  const courses = [
    {
      id: 1,
      title: "Mathematics",
      description: "Advanced calculus and algebra",
      filesCount: 5,
      isLocked: false,
    },
    {
      id: 2,
      title: "Physics",
      description: "Mechanics and thermodynamics",
      filesCount: 3,
      isLocked: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-900">Your Courses</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                course.isLocked ? "bg-gray-50" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <FileText className="h-4 w-4 mr-1" />
                    {course.filesCount} files
                  </div>
                </div>
                {course.isLocked && (
                  <Lock className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;