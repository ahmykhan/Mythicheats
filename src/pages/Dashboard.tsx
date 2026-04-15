
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Lock, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import CourseRegistrationModal from "@/components/onboarding/CourseRegistrationModal";

const Dashboard = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    checkRegistrationStatus();
    fetchCourses();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("usernames")
        .select("has_registered_courses")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data && !data.has_registered_courses) {
        setShowRegistration(true);
      }
    } finally {
      setCheckingRegistration(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase.from("courses").select("*");
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        <motion.h1
          className="text-2xl font-bold text-foreground"
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
            [...Array(3)].map((_, i) => (
              <motion.div key={`skeleton-${i}`} className="p-6 h-[180px] glass-card animate-pulse" variants={itemVariants} />
            ))
          ) : (
            courses.map((course) => (
              <motion.div key={course.id} variants={itemVariants}>
                <Link to={course.is_locked ? "#" : `/admin/courses`}>
                  <Card className={`p-6 hover:shadow-lg transition-shadow cursor-pointer glass-card ${course.is_locked ? "opacity-80" : ""}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                      </div>
                      {course.is_locked && <Lock className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      <CourseRegistrationModal
        open={showRegistration}
        onComplete={() => setShowRegistration(false)}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
