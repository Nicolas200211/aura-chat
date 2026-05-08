import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Message } from "../interfaces/message.interface";
import { getChatMessages, saveChatMessage, markMessagesAsRead } from "@/app/actions/chat-actions";

export function useRealtimeChat(conversationId: number | null, currentUserRole: 'user' | 'assistant' = 'user') {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const loadInitialMessages = async () => {
      setIsLoading(true);
      const msgs = await getChatMessages(conversationId);
      setMessages(msgs.map((m: any) => ({
        id: m.id.toString(),
        role: m.role,
        content: m.text,
        timestamp: new Date(m.timestamp)
      })));
      setIsLoading(false);
    };

    loadInitialMessages();

    const channel = supabase
      .channel(`chat:${conversationId}`, {
        config: {
          broadcast: { self: false }
        }
      })
      .on(
        "broadcast",
        { event: "new-message" },
        (payload: any) => {
          // Supabase wraps the sent payload inside payload.payload
          const message = payload.payload?.message;

          if (!message) return;

          try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch (e) {}

          setMessages((current) => {
            if (current.some(m => m.id === message.id)) return current;
            return [...current, {
              ...message,
              timestamp: new Date(message.timestamp)
            }];
          });

          markMessagesAsRead(conversationId);
        }
      )
      .subscribe();

    // Store the subscribed channel so sendMessage can reuse it
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId]);

  const sendMessage = async (content: string, role: 'user' | 'assistant' = 'user') => {
    if (!content.trim() || !conversationId) return;

    const messageId = `msg-${Date.now()}`;
    const newMsg: Message = {
      id: messageId,
      role,
      content,
      timestamp: new Date(),
    };

    // Optimistic update
    setMessages(prev => [...prev, newMsg]);

    // Broadcast via the already-subscribed channel (required for WebSocket delivery)
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'new-message',
        payload: { message: newMsg }
      });
    }

    try {
      await saveChatMessage({
        conversationId,
        role,
        content
      });
    } catch (error) {
      console.error("Error guardando en DB:", error);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage
  };
}
