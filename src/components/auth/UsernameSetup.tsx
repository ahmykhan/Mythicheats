
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface UsernameSetupProps {
  onUsernameSet: (username: string) => void;
  userEmail: string;
}

const UsernameSetup: React.FC<UsernameSetupProps> = ({ onUsernameSet, userEmail }) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("usernames")
        .insert({
          user_id: user.id,
          username: username.trim()
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Username taken",
            description: "This username is already in use. Please choose another.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Username set successfully!",
          description: `Welcome, ${username}!`
        });
        onUsernameSet(username);
      }
    } catch (error) {
      console.error("Error setting username:", error);
      toast({
        title: "Error",
        description: "Failed to set username. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md p-6 glass-card">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Choose Your Username</h1>
            <p className="text-gray-600">Logged in as: {userEmail}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter username (3-30 characters)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_]+"
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Only letters, numbers, and underscores allowed
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || username.length < 3}
            >
              {loading ? "Setting Username..." : "Continue"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default UsernameSetup;
