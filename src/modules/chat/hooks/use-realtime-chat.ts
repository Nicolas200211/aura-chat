import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Message } from "../interfaces/message.interface";
import { getChatMessages, saveChatMessage, markMessagesAsRead } from "@/app/actions/chat-actions";
import { playIncomingSound } from "@/lib/sound";

export function useRealtimeChat(conversationId: number | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const notifyChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSendingRef = useRef(false);
  // IDs reales de mensajes que nosotros enviamos — para no duplicarlos cuando llega el evento de DB
  const ownPendingIds = useRef<Set<string>>(new Set());

  // Canal compartido para notificar al nav del OTRO dispositivo (badge + sonido)
  useEffect(() => {
    const ch = supabase
      .channel("notifications:global", { config: { broadcast: { self: false } } })
      .subscribe();
    notifyChannelRef.current = ch;
    return () => {
      supabase.removeChannel(ch);
      notifyChannelRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!conversationId) return;
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

    // Nombre único por mount para evitar que el doble-mount de StrictMode desconecte el WebSocket
    const channel = supabase
      .channel(`chat-${conversationId}-${Date.now()}`)
      .on(
        // @ts-ignore
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes", // nombre real en la base de datos
        },
        (payload: any) => {
          if (!active) return;
          const row = payload.new;

          // Filtrar por conversación en el cliente (columnas con espacios no admiten filter server-side)
          const rowConvId = row["ID de conversación"];
          if (Number(rowConvId) !== conversationId) return;

          const msgId   = String(row["identificación"]);
          const msgText = String(row["texto"] ?? "");
          const msgRole = (row["role"] ?? "user") as "user" | "assistant";
          const msgTs   = new Date(row["marca de tiempo"] ?? Date.now());

          // Si es un mensaje que nosotros acabamos de enviar, solo reemplaza el ID temporal
          if (ownPendingIds.current.has(msgId)) {
            ownPendingIds.current.delete(msgId);
            setMessages((prev) =>
              prev.map((m) =>
                m.id.startsWith("msg-") && m.role === msgRole && m.content === msgText
                  ? { ...m, id: msgId }
                  : m
              )
            );
            return;
          }

          // Mensaje nuevo del otro lado — agregarlo y reproducir sonido
          setMessages((prev) => {
            if (prev.some((m) => m.id === msgId)) return prev;
            return [...prev, { id: msgId, role: msgRole, content: msgText, timestamp: msgTs }];
          });

          playIncomingSound();
          markMessagesAsRead(conversationId);
        }
      )
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

      const tempId = `msg-${Date.now()}`;
      const newMsg: Message = { id: tempId, role, content, timestamp: new Date() };

      // Update optimista: el emisor ve el mensaje de inmediato sin esperar la DB
      setMessages((prev) => [...prev, newMsg]);

      try {
        const saved = await saveChatMessage({ conversationId, role, content });
        // Registrar el ID real para que postgres_changes no lo duplique
        ownPendingIds.current.add(String(saved.id));

        // Notificar al nav del otro dispositivo via WebSocket (badge + sonido)
        notifyChannelRef.current?.send({
          type: "broadcast",
          event: "new-notification",
          payload: { conversationId },
        });
      } catch (error) {
        console.error("Error guardando en DB:", error);
        // Revertir el update optimista si falló el guardado
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        isSendingRef.current = false;
      }
    },
    [conversationId]
  );

  return { messages, isLoading, sendMessage };
}
