import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Copy, UserMinus, UserPlus, Shield } from "lucide-react";

interface Participant {
  id: string;
  user_id: string;
  role: string;
  username: string;
}

interface GroupInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  roomName: string;
  joinCode: string | null;
  roomType: string;
}

const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  open,
  onOpenChange,
  roomId,
  roomName,
  joinCode,
  roomType,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ user_id: string; username: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchCurrentUser();
      fetchParticipants();
    }
  }, [open, roomId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchParticipants = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: parts } = await supabase
      .from("room_participants")
      .select("id, user_id, role")
      .eq("room_id", roomId);

    if (!parts) return;

    // Fetch usernames for all participants
    const userIds = parts.map((p) => p.user_id);
    const { data: usernames } = await supabase
      .from("usernames")
      .select("user_id, username")
      .in("user_id", userIds);

    const usernameMap = new Map(
      (usernames || []).map((u) => [u.user_id, u.username])
    );

    const enriched: Participant[] = parts.map((p) => ({
      ...p,
      username: usernameMap.get(p.user_id) || "Unknown User",
    }));

    setParticipants(enriched);

    const currentPart = parts.find((p) => p.user_id === user.id);
    setIsCurrentUserAdmin(currentPart?.role === "admin");
  };

  const copyJoinCode = () => {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode);
      toast({ title: "Copied!", description: "Join code copied to clipboard." });
    }
  };

  const kickMember = async (participantId: string, username: string) => {
    if (!confirm(`Remove ${username} from the group?`)) return;
    try {
      const { error } = await supabase
        .from("room_participants")
        .delete()
        .eq("id", participantId);
      if (error) throw error;
      toast({ title: "Removed", description: `${username} has been removed.` });
      fetchParticipants();
    } catch {
      toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" });
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("usernames")
        .select("user_id, username")
        .ilike("username", `%${searchQuery.trim()}%`)
        .limit(10);

      const participantIds = new Set(participants.map((p) => p.user_id));
      setSearchResults(
        (data || []).filter((u) => !participantIds.has(u.user_id))
      );
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (userId: string, username: string) => {
    try {
      const { error } = await supabase
        .from("room_participants")
        .insert({ room_id: roomId, user_id: userId, role: "member" });

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already a member", description: `${username} is already in this group.` });
        } else throw error;
      } else {
        toast({ title: "Added", description: `${username} has been added.` });
        setSearchResults((prev) => prev.filter((u) => u.user_id !== userId));
        fetchParticipants();
      }
    } catch {
      toast({ title: "Error", description: "Failed to add member.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{roomName}</DialogTitle>
          <DialogDescription>
            {roomType === "group" ? "Group info and members" : "Room information"}
          </DialogDescription>
        </DialogHeader>

        {/* Join Code Section */}
        {joinCode && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Join Code</p>
              <p className="font-mono text-lg font-bold tracking-widest">{joinCode}</p>
            </div>
            <Button variant="outline" size="sm" onClick={copyJoinCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Members List */}
        <div>
          <p className="text-sm font-medium mb-2">
            Members ({participants.length})
          </p>
          <ScrollArea className="max-h-48">
            <div className="space-y-1">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{p.username}</span>
                    {p.role === "admin" && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Shield className="h-3 w-3" /> Admin
                      </Badge>
                    )}
                  </div>
                  {isCurrentUserAdmin && p.user_id !== currentUserId && p.role !== "admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-destructive hover:text-destructive"
                      onClick={() => kickMember(p.id, p.username)}
                    >
                      <UserMinus className="h-3 w-3 mr-1" /> Kick
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Add Member (Admin only) */}
        {isCurrentUserAdmin && (
          <div>
            <p className="text-sm font-medium mb-2">Add Member</p>
            <div className="flex gap-2">
              <Input
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                className="flex-1"
              />
              <Button size="sm" onClick={searchUsers} disabled={loading}>
                Search
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1">
                {searchResults.map((u) => (
                  <div
                    key={u.user_id}
                    className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50"
                  >
                    <span className="text-sm">{u.username}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7"
                      onClick={() => addMember(u.user_id, u.username)}
                    >
                      <UserPlus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GroupInfoModal;
