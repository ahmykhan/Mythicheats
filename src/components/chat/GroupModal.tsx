import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface GroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "create" | "join";
}

const GroupModal: React.FC<GroupModalProps> = ({ open, onOpenChange, defaultTab = "create" }) => {
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const code = generateCode();
      const { data: room, error } = await supabase
        .from("chat_rooms")
        .insert({ name: groupName.trim(), type: "group", join_code: code, created_by: user.id })
        .select()
        .single();

      if (error) throw error;

      // Add creator as participant
      await supabase.from("room_participants").insert({ room_id: room.id, user_id: user.id });

      toast({
        title: "Group Created!",
        description: `Share this join code: ${code}`,
      });
      setGroupName("");
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: room, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("join_code", joinCode.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;
      if (!room) {
        toast({ title: "Not Found", description: "No group with that code.", variant: "destructive" });
        return;
      }

      const { error: joinError } = await supabase
        .from("room_participants")
        .insert({ room_id: room.id, user_id: user.id });

      if (joinError) {
        if (joinError.code === "23505") {
          toast({ title: "Already joined", description: "You're already in this group." });
        } else {
          throw joinError;
        }
      } else {
        toast({ title: "Joined!", description: `You joined "${room.name}"` });
      }

      setJoinCode("");
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Groups</DialogTitle>
          <DialogDescription>Create a new group or join an existing one with a code.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="join">Join</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-3 mt-3">
            <Input
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Button onClick={handleCreate} disabled={loading || !groupName.trim()} className="w-full">
              {loading ? "Creating…" : "Create Group"}
            </Button>
          </TabsContent>

          <TabsContent value="join" className="space-y-3 mt-3">
            <Input
              placeholder="Enter join code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <Button onClick={handleJoin} disabled={loading || !joinCode.trim()} className="w-full">
              {loading ? "Joining…" : "Join Group"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default GroupModal;
