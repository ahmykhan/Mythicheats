import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Trash2, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
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
}

const ChatRoom: React.FC<ChatRoomProps> = ({ currentUsername, isAdmin = false, roomId, roomName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMessages([]);
    fetchMessages();

    const channel = supabase
      .channel(`chat-room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
          if ((payload.new as any).username !== currentUsername && Notification.permission === "granted") {
            new Notification(`New message from ${(payload.new as any).username}`, {
              body: (payload.new as any).message,
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

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("chat_messages").insert({
        user_id: user.id,
        username: currentUsername,
        message: newMessage.trim(),
        room_id: roomId,
      });

      if (error) throw error;
      setNewMessage("");
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

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">{roomName}</h2>
        {isAdmin && (
          <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">Admin</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.username === currentUsername ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                  msg.username === currentUsername
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.username !== currentUsername && (
                  <p className="text-xs font-semibold mb-1 opacity-70">{msg.username}</p>
                )}
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs mt-1 opacity-60">{formatTime(msg.created_at)}</p>

                {/* Action buttons on hover */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {msg.username !== currentUsername && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-6 h-6 p-0"
                      onClick={() => reportMessage(msg.id)}
                      title="Report message"
                    >
                      <Flag className="h-3 w-3" />
                    </Button>
                  )}
                  {isAdmin && (
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
          ))}
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
    </div>
  );
};

export default ChatRoom;
