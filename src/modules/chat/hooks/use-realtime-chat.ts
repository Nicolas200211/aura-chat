import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Message } from "../interfaces/message.interface";
import { getChatMessages, saveChatMessage, markMessagesAsRead, getConversationDetails } from "@/app/actions/chat-actions";

export function useRealtimeChat(conversationId: number | null, currentUserRole: 'user' | 'assistant' = 'user') {
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

    // 2. Configurar WebSockets Directos (Broadcast)
    const channel = supabase
      .channel(`chat:${conversationId}`, {
        config: {
          broadcast: { self: false } // No recibir mis propios mensajes
        }
      })
      .on(
        "broadcast",
        { event: "new-message" },
        (payload: any) => {
          const { message } = payload;
          
          // Reproducir sonido
          try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch (e) {}

          // Actualizar UI
          setMessages((current) => {
            if (current.some(m => m.id === message.id)) return current;
            return [...current, {
              ...message,
              timestamp: new Date(message.timestamp)
            }];
          });
          
          // Marcar como leído en DB (en segundo plano)
          markMessagesAsRead(conversationId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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

    // 1. Optimistic Update (Yo lo veo al instante)
    setMessages(prev => [...prev, newMsg]);

    // 2. Broadcast vía WebSocket (El otro lo ve al instante)
    const channel = supabase.channel(`chat:${conversationId}`);
    channel.send({
      type: 'broadcast',
      event: 'new-message',
      payload: { message: newMsg }
    });

    // 3. Persistencia en DB y Notificación Global
    try {
      const saved = await saveChatMessage({
        conversationId,
        role,
        content
      });

      // Notificar al destinatario vía canal global si tenemos su ID
      // Buscamos quién debe recibir la notificación (el otro en la conversación)
      const details = await getConversationDetails(conversationId);
      // Aquí necesitaríamos el userId real del otro, pero para simplificar
      // usaremos el canal de la conversación para notificar globalmente a los que escuchen
      const globalChannel = supabase.channel(`notifications:global`);
      globalChannel.send({
        type: 'broadcast',
        event: 'new-notification',
        payload: { conversationId }
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
