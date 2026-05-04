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
  const [prefillMessage, setPrefillMessage] = useState<string>("");
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
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      // Backwards compat: detail can be a Room directly, or { room, prefillMessage }
      if (detail.room) {
        setSelectedRoom(detail.room as Room);
        setPrefillMessage(detail.prefillMessage || "");
      } else {
        setSelectedRoom(detail as Room);
        setPrefillMessage("");
      }
    };
    window.addEventListener("navigate-to-dm", handler);
    return () => window.removeEventListener("navigate-to-dm", handler);
  }, []);

  // Request notification permission once on mount
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Cross-room push notifications: notify when tab is hidden and message is in a room the user belongs to.
  useEffect(() => {
    let userId: string | null = null;
    const memberRoomIds = new Set<string>();

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;

      const { data: parts } = await supabase
        .from("room_participants")
        .select("room_id")
        .eq("user_id", user.id);
      (parts || []).forEach((p) => memberRoomIds.add(p.room_id));

      const { data: globals } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("type", "global");
      (globals || []).forEach((g) => memberRoomIds.add(g.id));
    })();

    const channel = supabase
      .channel("global-message-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const msg = payload.new as { user_id: string; username: string; message: string; room_id: string | null };
          if (!userId || msg.user_id === userId) return;
          if (!msg.room_id || !memberRoomIds.has(msg.room_id)) return;
          if (typeof document !== "undefined" && document.visibilityState !== "hidden") return;
          if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
          try {
            new Notification(`New message from ${msg.username}`, {
              body: msg.message,
              icon: "/placeholder.svg",
            });
          } catch {}
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "room_participants" },
        (payload) => {
          const p = payload.new as { user_id: string; room_id: string };
          if (userId && p.user_id === userId) memberRoomIds.add(p.room_id);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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
              prefillMessage={prefillMessage}
              onPrefillConsumed={() => setPrefillMessage("")}
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
