
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeSelector from "@/components/theme/ThemeSelector";

const ADMIN_EMAIL = "furyboy4592@gmail.com";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateRandomCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });

      if (error) throw error;
      
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        variant: "destructive",
        title: "Google login failed",
        description: "Unable to sign in with Google. Please try again.",
      });
      setIsGoogleLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address first.",
      });
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for the reset link.",
      });
    } catch (error) {
      console.error("Reset error:", error);
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: "Unable to send reset email. Please try again.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Visual elements for background decorations
  const CircleDecoration = ({ className, ...props }) => (
    <motion.div
      className={`absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: [0.8, 1.2, 0.8], 
        opacity: [0, 0.7, 0],
      }}
      transition={{
        duration: 8,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
      }}
      {...props}
    />
  );

  // Form animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-300">
        {/* Background decorations */}
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
          <CircleDecoration className="bg-blue-300 dark:bg-blue-700 w-96 h-96 left-[-10%] top-[15%]" />
          <CircleDecoration className="bg-purple-300 dark:bg-purple-700 w-96 h-96 right-[-5%] top-[40%]" delay={1.5} />
          <CircleDecoration className="bg-pink-300 dark:bg-pink-700 w-96 h-96 bottom-[-10%] left-[30%]" delay={3} />
        </div>
        
        <div className="absolute top-4 right-4 z-50">
          <ThemeSelector />
        </div>

        <div className="w-full max-w-md space-y-8 px-4">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold text-primary font-display bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-700">
              Mythic Cheats
            </h1>
            <p className="mt-2 text-foreground/80">Sign in to your account</p>
          </motion.div>

          <motion.form 
            onSubmit={handleLogin} 
            className="mt-8 space-y-6 p-8 rounded-2xl glass-card backdrop-blur-xl bg-white/10 dark:bg-black/30 border border-white/20 shadow-xl"
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="space-y-4">
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/20 dark:bg-gray-900/50"
                  placeholder="Enter your email"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/20 dark:bg-gray-900/50"
                  placeholder="Enter your password"
                />
              </motion.div>
            </div>

            <motion.div className="flex flex-col space-y-4" variants={itemVariants}>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div 
                    className="h-5 w-5 rounded-full border-2 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : "Sign in with Email"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-2 backdrop-blur-sm bg-white/10 dark:bg-black/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" stroke="none"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" stroke="none"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" stroke="none"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" stroke="none"/>
                  <path d="M1 1h22v22H1z" fill="none"/>
                </svg>
                {isGoogleLoading ? (
                  <motion.div 
                    className="h-5 w-5 rounded-full border-2 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : "Sign in with Google"}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={handleResetPassword}
                disabled={isResetting}
                className="w-full mt-2 backdrop-blur-sm hover:bg-white/5"
              >
                {isResetting ? "Sending reset link..." : "Reset Password"}
              </Button>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Login;
