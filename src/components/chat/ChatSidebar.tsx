import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Users, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatRoom {
  id: string;
  name: string;
  type: string;
  join_code: string | null;
}

interface ChatSidebarProps {
  currentRoomId: string | null;
  onRoomSelect: (room: ChatRoom) => void;
  onCreateGroup: () => void;
  onJoinGroup: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentRoomId,
  onRoomSelect,
  onCreateGroup,
  onJoinGroup,
}) => {
  const [globalRoom, setGlobalRoom] = useState<ChatRoom | null>(null);
  const [groupRooms, setGroupRooms] = useState<ChatRoom[]>([]);
  const [dmRooms, setDmRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    fetchRooms();

    const channel = supabase
      .channel("room-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_rooms" }, () => fetchRooms())
      .on("postgres_changes", { event: "*", schema: "public", table: "room_participants" }, () => fetchRooms())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRooms = async () => {
    // Fetch global room
    const { data: globalData } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("type", "global")
      .limit(1)
      .maybeSingle();

    if (globalData) setGlobalRoom(globalData as ChatRoom);

    // Fetch rooms user participates in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: participations } = await supabase
      .from("room_participants")
      .select("room_id")
      .eq("user_id", user.id);

    if (participations && participations.length > 0) {
      const roomIds = participations.map((p) => p.room_id);
      const { data: rooms } = await supabase
        .from("chat_rooms")
        .select("*")
        .in("id", roomIds);

      if (rooms) {
        setGroupRooms((rooms as ChatRoom[]).filter((r) => r.type === "group"));
        setDmRooms((rooms as ChatRoom[]).filter((r) => r.type === "dm"));
      }
    } else {
      setGroupRooms([]);
      setDmRooms([]);
    }
  };

  const iconForType = (type: string) => {
    if (type === "global") return <Globe className="h-4 w-4 shrink-0" />;
    if (type === "group") return <Users className="h-4 w-4 shrink-0" />;
    return <MessageSquare className="h-4 w-4 shrink-0" />;
  };

  const RoomButton = ({ room }: { room: ChatRoom }) => (
    <button
      onClick={() => onRoomSelect(room)}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left",
        currentRoomId === room.id
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted"
      )}
    >
      {iconForType(room.type)}
      <span className="truncate">{room.name}</span>
    </button>
  );

  return (
    <div className="w-56 border-r flex flex-col h-full bg-background">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm">Chats</h3>
      </div>

      <ScrollArea className="flex-1 p-2">
        {/* Global */}
        {globalRoom && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground px-2 mb-1">GLOBAL</p>
            <RoomButton room={globalRoom} />
          </div>
        )}

        {/* Groups */}
        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground px-2 mb-1">GROUPS</p>
          {groupRooms.map((r) => (
            <RoomButton key={r.id} room={r} />
          ))}
          <div className="flex gap-1 mt-1 px-1">
            <Button variant="ghost" size="sm" className="text-xs h-7 flex-1" onClick={onCreateGroup}>
              <Plus className="h-3 w-3 mr-1" /> Create
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-7 flex-1" onClick={onJoinGroup}>
              Join
            </Button>
          </div>
        </div>

        {/* DMs */}
        {dmRooms.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground px-2 mb-1">DIRECT MESSAGES</p>
            {dmRooms.map((r) => (
              <RoomButton key={r.id} room={r} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;
