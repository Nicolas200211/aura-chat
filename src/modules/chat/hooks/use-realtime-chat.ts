import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Message } from "../interfaces/message.interface";
import { getChatMessages, saveChatMessage, markMessagesAsRead } from "@/app/actions/chat-actions";

export function useRealtimeChat(conversationId: number | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSendingRef = useRef(false);

  useEffect(() => {
    if (!conversationId) return;

    // Guard: prevents stale async callbacks from updating state after cleanup
    let active = true;

    setIsLoading(true);
    getChatMessages(conversationId).then((msgs) => {
      if (!active) return;
      setMessages(
        msgs.map((m: any) => ({
          id: m.id.toString(),
          role: m.role,
          content: m.text,
          timestamp: new Date(m.timestamp),
        }))
      );
      setIsLoading(false);
    });

    // Use a unique channel name to avoid Supabase reusing a partially-closed channel
    const channelName = `chat-${conversationId}-${Date.now()}`;

    const channel = supabase
      .channel(channelName, {
        config: { broadcast: { self: false } },
      })
      .on("broadcast", { event: "new-message" }, ({ payload }: any) => {
        const message = payload?.message;
        if (!message || !active) return;

        try {
          const audio = new Audio(
            "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"
          );
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch {}

        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, { ...message, timestamp: new Date(message.timestamp) }];
        });

        markMessagesAsRead(conversationId);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      active = false;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string, role: "user" | "assistant" = "user") => {
      if (!content.trim() || !conversationId || isSendingRef.current) return;

      isSendingRef.current = true;

      const messageId = `msg-${Date.now()}`;
      const newMsg: Message = {
        id: messageId,
        role,
        content,
        timestamp: new Date(),
      };

      // Optimistic update
      setMessages((prev) => [...prev, newMsg]);

      // Broadcast via the already-subscribed channel (WebSocket, no REST fallback)
      channelRef.current?.send({
        type: "broadcast",
        event: "new-message",
        payload: { message: newMsg },
      });

      try {
        await saveChatMessage({ conversationId, role, content });
      } catch (error) {
        console.error("Error guardando en DB:", error);
      } finally {
        isSendingRef.current = false;
      }
    },
    [conversationId]
  );

  return { messages, isLoading, sendMessage };
}
