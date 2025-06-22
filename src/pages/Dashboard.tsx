
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Lock, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const Dashboard = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*");
        
        if (error) throw error;
        
        setCourses(data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        // Fallback to sample courses if there's an error
        setCourses([
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
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
    
    console.log("Dashboard theme:", theme);
  }, [theme]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2,
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        <motion.h1 
          className={`text-2xl font-bold ${theme === 'purple' ? 'mythic-fire-text' : ''}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Courses
        </motion.h1>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {loading ? (
            // Loading skeleton
            [...Array(3)].map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                className="p-6 h-[180px] glass-card animate-pulse"
                variants={itemVariants}
              ></motion.div>
            ))
          ) : (
            courses.map((course) => (
              <motion.div key={course.id} variants={itemVariants}>
                <Link to={course.isLocked ? "#" : `/admin/courses`}>
                  <Card
                    className={`p-6 hover:shadow-lg transition-shadow cursor-pointer glass-card ${
                      course.isLocked ? "opacity-80" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{course.description}</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <FileText className="h-4 w-4 mr-1" />
                          {course.filesCount || 0} files
                        </div>
                      </div>
                      {course.isLocked && (
                        <Lock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
