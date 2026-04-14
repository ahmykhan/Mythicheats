import React, { useState, useEffect } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatRoom from "./ChatRoom";
import GroupModal from "./GroupModal";
import { supabase } from "@/integrations/supabase/client";

interface ChatContainerProps {
  currentUsername: string;
  isAdmin?: boolean;
}

interface Room {
  id: string;
  name: string;
  type: string;
  join_code: string | null;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ currentUsername, isAdmin = false }) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalTab, setGroupModalTab] = useState<"create" | "join">("create");

  // Auto-select global room on mount
  useEffect(() => {
    const fetchGlobal = async () => {
      const { data } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("type", "global")
        .limit(1)
        .maybeSingle();
      if (data) setSelectedRoom(data as Room);
    };
    fetchGlobal();
  }, []);

  // Listen for DM navigation from Lost & Found
  useEffect(() => {
    const handler = (e: Event) => {
      const room = (e as CustomEvent).detail;
      if (room) setSelectedRoom(room);
    };
    window.addEventListener("navigate-to-dm", handler);
    return () => window.removeEventListener("navigate-to-dm", handler);
  }, []);

  return (
    <div className="flex h-[calc(100vh-200px)] rounded-lg border overflow-hidden bg-background">
      <ChatSidebar
        currentRoomId={selectedRoom?.id || null}
        onRoomSelect={(room) => setSelectedRoom(room)}
        onCreateGroup={() => {
          setGroupModalTab("create");
          setGroupModalOpen(true);
        }}
        onJoinGroup={() => {
          setGroupModalTab("join");
          setGroupModalOpen(true);
        }}
      />

      <div className="flex-1">
        {selectedRoom ? (
          <ChatRoom
            currentUsername={currentUsername}
            isAdmin={isAdmin}
            roomId={selectedRoom.id}
            roomName={selectedRoom.name}
            joinCode={selectedRoom.join_code}
            roomType={selectedRoom.type}
            onNavigateToRoom={(room) => setSelectedRoom(room)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a chat room to start messaging
          </div>
        )}
      </div>

      <GroupModal
        open={groupModalOpen}
        onOpenChange={setGroupModalOpen}
        defaultTab={groupModalTab}
      />
    </div>
  );
};

export default ChatContainer;
