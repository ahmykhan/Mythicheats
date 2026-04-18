import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquarePlus, Search, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface NewDMSearchProps {
  onDMCreated: (room: { id: string; name: string; type: string; join_code: string | null }) => void;
}

export const startDM = async (
  targetUserId: string,
  targetUsername: string
): Promise<{ id: string; name: string; type: string; join_code: string | null } | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (targetUserId === user.id) throw new Error("Cannot DM yourself");

  // Check if DM room already exists between these two users
  const { data: myRooms } = await supabase
    .from("room_participants")
    .select("room_id")
    .eq("user_id", user.id);

  if (myRooms && myRooms.length > 0) {
    const roomIds = myRooms.map((r) => r.room_id);
    
    // Find DM rooms among these
    const { data: dmRooms } = await supabase
      .from("chat_rooms")
      .select("id, name, type, join_code")
      .in("id", roomIds)
      .eq("type", "dm");

    if (dmRooms) {
      for (const room of dmRooms) {
        const { data: participants } = await supabase
          .from("room_participants")
          .select("user_id")
          .eq("room_id", room.id);

        if (participants && participants.length === 2) {
          const ids = participants.map((p) => p.user_id);
          if (ids.includes(user.id) && ids.includes(targetUserId)) {
            return room;
          }
        }
      }
    }
  }

  // Get current user's username
  const { data: myUsername } = await supabase
    .from("usernames")
    .select("username")
    .eq("user_id", user.id)
    .maybeSingle();

  const dmName = `${myUsername?.username || "User"} & ${targetUsername}`;

  // Create new DM room
  const { data: newRoom, error } = await supabase
    .from("chat_rooms")
    .insert({ name: dmName, type: "dm", created_by: user.id })
    .select("id, name, type, join_code")
    .single();

  if (error) throw error;

  // Add both participants
  await supabase.from("room_participants").insert([
    { room_id: newRoom.id, user_id: user.id, role: "member" },
    { room_id: newRoom.id, user_id: targetUserId, role: "member" },
  ]);

  return newRoom;
};

const NewDMSearch: React.FC<NewDMSearchProps> = ({ onDMCreated }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ user_id: string; username: string; email: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.rpc("search_users", {
        search_query: query.trim(),
      });

      setResults((data || []).filter((u: any) => u.user_id !== user?.id));
    } finally {
      setSearching(false);
    }
  };

  const handleStartDM = async (targetUserId: string, targetUsername: string) => {
    setCreating(targetUserId);
    try {
      const room = await startDM(targetUserId, targetUsername);
      if (room) {
        onDMCreated(room);
        setShowSearch(false);
        setQuery("");
        setResults([]);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="mb-3">
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs h-7 mb-1"
        onClick={() => setShowSearch(!showSearch)}
      >
        <MessageSquarePlus className="h-3 w-3 mr-1" /> New Message
      </Button>

      {showSearch && (
        <div className="px-1 space-y-1">
          <div className="flex gap-1">
            <Input
              placeholder="Search by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="h-7 text-xs"
            />
            <Button size="sm" className="h-7 px-2" onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
            </Button>
          </div>

          {results.map((u) => (
            <button
              key={u.user_id}
              onClick={() => handleStartDM(u.user_id, u.username)}
              disabled={creating === u.user_id}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors text-left"
            >
              {creating === u.user_id ? (
                <Loader2 className="h-3 w-3 animate-spin shrink-0" />
              ) : (
                <MessageSquarePlus className="h-3 w-3 shrink-0" />
              )}
              <div className="truncate">
                <span className="font-medium">{u.username}</span>
                <span className="text-muted-foreground ml-1">
                  ({u.email?.split("@")[0]})
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewDMSearch;
