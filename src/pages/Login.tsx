import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

  const FloatingOrb = ({ className, delay = 0 }) => (
    <motion.div
      className={`absolute rounded-full blur-3xl mix-blend-screen ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [1, 1.2, 0.8, 1], 
        opacity: [0.3, 0.6, 0.4, 0.3],
        x: [0, 30, -20, 0],
        y: [0, -20, 10, 0]
      }}
      transition={{
        duration: 8,
        ease: "easeInOut",
        repeat: Infinity,
        delay: delay
      }}
    />
  );

  const MagicalParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Enhanced background with floating orbs */}
      <div className="bg-pattern"></div>
      <MagicalParticles />
      
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
        <FloatingOrb className="bg-gradient-to-r from-blue-400 to-purple-600 w-96 h-96 left-[-20%] top-[10%]" delay={0} />
        <FloatingOrb className="bg-gradient-to-r from-purple-400 to-pink-600 w-80 h-80 right-[-15%] top-[30%]" delay={2} />
        <FloatingOrb className="bg-gradient-to-r from-pink-400 to-orange-500 w-72 h-72 bottom-[-15%] left-[20%]" delay={4} />
        <FloatingOrb className="bg-gradient-to-r from-cyan-400 to-blue-500 w-64 h-64 right-[25%] bottom-[5%]" delay={6} />
      </div>
      
      <div className="absolute top-4 right-4 z-50">
        <ThemeSelector />
      </div>

      <div className="w-full max-w-md space-y-8 px-4 relative z-10">
        <motion.div 
          className="text-center relative"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-5xl font-bold font-display mb-4 relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "backOut" }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent bg-300% animate-gradient-x">
              Mythic Cheats
            </span>
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-lg blur opacity-20"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.h1>
          <motion.p 
            className="text-lg text-foreground/80 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Enter the realm of possibilities
          </motion.p>
        </motion.div>

        <motion.form 
          onSubmit={handleLogin} 
          className="mt-8 space-y-6 p-8 glass-card relative overflow-hidden"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          {/* Animated border gradient */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
              padding: '1px',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="space-y-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <label htmlFor="email" className="block text-sm font-semibold mb-2 text-foreground/90">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full glass-button border-2 h-12 text-base focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                placeholder="Enter your mystical email"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <label htmlFor="password" className="block text-sm font-semibold mb-2 text-foreground/90">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full glass-button border-2 h-12 text-base focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                placeholder="Enter your secret key"
              />
            </motion.div>
          </div>

          <motion.div 
            className="flex flex-col space-y-4 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div 
                  className="h-6 w-6 rounded-full border-2 border-white border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <span className="flex items-center gap-2">
                  ✨ Sign in with Email
                </span>
              )}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <motion.span 
                  className="w-full border-t border-foreground/20"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                />
              </div>
              <div className="relative flex justify-center text-sm uppercase font-medium">
                <span className="glass-card px-4 py-1 text-foreground/70">Or continue with</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full h-12 flex items-center justify-center gap-3 glass-button border-2 hover:border-primary/30 font-semibold text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isGoogleLoading ? (
                <motion.div 
                  className="h-5 w-5 rounded-full border-2 border-current border-t-transparent"
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
              className="w-full mt-4 glass-button hover:bg-foreground/5 font-medium"
            >
              {isResetting ? (
                <span className="flex items-center gap-2">
                  <motion.div 
                    className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Sending reset link...
                </span>
              ) : "🔑 Reset Password"}
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;
