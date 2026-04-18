import React, { useState, useEffect } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatRoom from "./ChatRoom";
import GroupModal from "./GroupModal";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const isMobile = useIsMobile();

  // Auto-select global room on mount (desktop only — mobile starts on chat list)
  useEffect(() => {
    if (isMobile) return;
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
  }, [isMobile]);

  // Listen for DM navigation from Lost & Found
  useEffect(() => {
    const handler = (e: Event) => {
      const room = (e as CustomEvent).detail;
      if (room) setSelectedRoom(room);
    };
    window.addEventListener("navigate-to-dm", handler);
    return () => window.removeEventListener("navigate-to-dm", handler);
  }, []);

  const showSidebar = !isMobile || !selectedRoom;
  const showChat = !isMobile || !!selectedRoom;

  return (
    <div className="flex h-[calc(100vh-200px)] rounded-lg border overflow-hidden bg-background">
      <div
        className={cn(
          "h-full",
          showSidebar ? "flex" : "hidden",
          isMobile ? "w-full" : "w-auto"
        )}
      >
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
      </div>

      <div className={cn("flex-1 h-full", showChat ? "flex" : "hidden")}>
        {selectedRoom ? (
          <div className="flex-1 flex flex-col">
            <ChatRoom
              currentUsername={currentUsername}
              isAdmin={isAdmin}
              roomId={selectedRoom.id}
              roomName={selectedRoom.name}
              joinCode={selectedRoom.join_code}
              roomType={selectedRoom.type}
              onNavigateToRoom={(room) => setSelectedRoom(room)}
              onBack={isMobile ? () => setSelectedRoom(null) : undefined}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full w-full text-muted-foreground">
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
