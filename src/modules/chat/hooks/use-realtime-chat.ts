import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Message } from "../interfaces/message.interface";
import { getChatMessages, saveChatMessage } from "@/app/actions/chat-actions";

export function useRealtimeChat(conversationId: number | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    // 1. Cargar mensajes iniciales
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

    // 2. Configurar WebSockets (Supabase Realtime Channel)
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
          filter: `ID de conversación=eq.${conversationId}`
        },
        (payload: any) => {
          const newMsg = payload.new;
          
          // Evitar duplicados locales (mensajes enviados por nosotros que ya se añadieron al estado)
          setMessages((current) => {
            if (current.some(m => m.id === newMsg.id.toString())) return current;
            
            return [...current, {
              id: newMsg.id.toString(),
              role: newMsg.role,
              content: newMsg.texto,
              timestamp: new Date(newMsg['marca de tiempo'])
            }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (content: string, role: 'user' | 'assistant' = 'user') => {
    if (!content.trim() || !conversationId) return;

    // Optimistic Update
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await saveChatMessage({
        conversationId,
        role,
        content
      });
      // El mensaje real llegará vía WebSocket y reemplazará/completará la UI
    } catch (error) {
      console.error("Error enviando mensaje real:", error);
      // Podríamos eliminar el mensaje optimista aquí si falla
    }
  };

  return {
    messages,
    isLoading,
    sendMessage
  };
}
