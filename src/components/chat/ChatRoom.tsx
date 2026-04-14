import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Trash2, Flag, Info, MessageSquarePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import GroupInfoModal from "./GroupInfoModal";
import { startDM } from "./NewDMSearch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
  room_id: string | null;
}

interface ChatRoomProps {
  currentUsername: string;
  isAdmin?: boolean;
  roomId: string;
  roomName: string;
  joinCode?: string | null;
  roomType?: string;
  onNavigateToRoom?: (room: { id: string; name: string; type: string; join_code: string | null }) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ currentUsername, isAdmin = false, roomId, roomName, joinCode, roomType, onNavigateToRoom }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isOfficialRoom = roomType === "section" || roomType === "course";

  useEffect(() => {
    setMessages([]);
    fetchMessages();

    const channel = supabase
      .channel(`chat-room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            // Deduplicate: skip if already present (optimistic or duplicate broadcast)
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.username !== currentUsername && typeof Notification !== 'undefined' && Notification.permission === "granted") {
            new Notification(`New message from ${newMsg.username}`, {
              body: newMsg.message,
              icon: "/placeholder.svg",
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (!error) setMessages(data || []);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const optimisticId = crypto.randomUUID();
      const optimisticMsg: ChatMessage = {
        id: optimisticId,
        user_id: user.id,
        username: currentUsername,
        message: messageText,
        created_at: new Date().toISOString(),
        room_id: roomId,
      };

      // Optimistic append
      setMessages((prev) => [...prev, optimisticMsg]);

      const { data, error } = await supabase.from("chat_messages").insert({
        user_id: user.id,
        username: currentUsername,
        message: messageText,
        room_id: roomId,
      }).select("id").single();

      if (error) {
        // Rollback optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        throw error;
      }

      // Replace optimistic ID with real ID so realtime dedup works
      if (data) {
        setMessages((prev) => prev.map((m) => m.id === optimisticId ? { ...m, id: data.id } : m));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const { error } = await supabase.from("chat_messages").delete().eq("id", messageId);
      if (error) throw error;
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast({ title: "Deleted", description: "Message removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const reportMessage = async (messageId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("reports").insert({
        message_id: messageId,
        reporter_id: user.id,
      });

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already reported", description: "You've already flagged this message." });
        } else {
          throw error;
        }
      } else {
        toast({ title: "Reported", description: "Message has been flagged for review." });
      }
    } catch {
      toast({ title: "Error", description: "Failed to report.", variant: "destructive" });
    }
  };

  const handleStartDM = async (userId: string, username: string) => {
    try {
      const room = await startDM(userId, username);
      if (room && onNavigateToRoom) {
        onNavigateToRoom(room);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Show info button for group, section, and course rooms
  const showInfoButton = roomType === "group" || isOfficialRoom;
  // Show admin controls only in non-official rooms when user is admin
  const showAdminControls = isAdmin && !isOfficialRoom;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">{roomName}</h2>
        <div className="flex items-center gap-2">
          {showInfoButton && (
            <Button variant="ghost" size="sm" onClick={() => setShowGroupInfo(true)}>
              <Info className="h-4 w-4 mr-1" /> Info
            </Button>
          )}
          {showAdminControls && (
            <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">Admin</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => {
            const isOwn = msg.username === currentUsername;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                    isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {!isOwn && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-xs font-semibold mb-1 opacity-70 hover:opacity-100 cursor-pointer">
                          {msg.username}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" side="top">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleStartDM(msg.user_id, msg.username)}
                        >
                          <MessageSquarePlus className="h-3 w-3 mr-1" /> Start DM
                        </Button>
                      </PopoverContent>
                    </Popover>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs mt-1 opacity-60">{formatTime(msg.created_at)}</p>

                  {/* Action buttons on hover */}
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!isOwn && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-full w-6 h-6 p-0"
                        onClick={() => reportMessage(msg.id)}
                        title="Report message"
                      >
                        <Flag className="h-3 w-3" />
                      </Button>
                    )}
                    {showAdminControls && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full w-6 h-6 p-0"
                        onClick={() => deleteMessage(msg.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 0 && (
        <div className="text-center text-muted-foreground py-4">
          No messages yet. Start the conversation!
        </div>
      )}

      <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
          disabled={sending}
        />
        <Button type="submit" disabled={sending || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {showInfoButton && (
        <GroupInfoModal
          open={showGroupInfo}
          onOpenChange={setShowGroupInfo}
          roomId={roomId}
          roomName={roomName}
          joinCode={joinCode || null}
          roomType={roomType || "group"}
        />
      )}
    </div>
  );
};

export default ChatRoom;
