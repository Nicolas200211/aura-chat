import { useState, useEffect } from "react";
import { Message } from "../interfaces/message.interface";
import { 
  getChatMessages, 
  saveChatMessage, 
  getGeminiResponse, 
  clearChatHistory,
  getConversations,
  createConversation
} from "@/app/actions/chat-actions";

export function useChat() {
  const [conversationsList, setConversationsList] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar lista de conversaciones al inicio
  useEffect(() => {
    const init = async () => {
      const list = await getConversations();
      setConversationsList(list);
      
      if (list.length > 0) {
        setActiveConversationId(list[0].id);
      } else {
        const newConv = await createConversation("Nueva conversación");
        setConversationsList([newConv]);
        setActiveConversationId(newConv.id);
      }
    };
    init();
  }, []);

  // Cargar mensajes cuando cambia la conversación activa
  useEffect(() => {
    if (!activeConversationId) return;

    const loadMessages = async () => {
      const msgs = await getChatMessages(activeConversationId);
      if (msgs.length > 0) {
        setMessages(msgs.map((m: any) => ({
          id: m.id.toString(),
          role: m.role,
          content: m.text,
          timestamp: new Date(m.timestamp)
        })));
      } else {
        setMessages([{
          id: "initial",
          role: "assistant",
          content: "¡Hola! Soy Aura Chat, tu asistente para el bienestar emocional. ¿Cómo te sientes hoy?",
          timestamp: new Date(),
        }]);
      }
    };
    loadMessages();
  }, [activeConversationId]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !activeConversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      await saveChatMessage({
        conversationId: activeConversationId,
        role: 'user',
        content: content
      });

      const aiResponseText = await getGeminiResponse(content, messages);

      const savedAssistantMsg = await saveChatMessage({
        conversationId: activeConversationId,
        role: 'assistant',
        content: aiResponseText
      });

      const assistantMessage: Message = {
        id: savedAssistantMsg.id.toString(),
        role: "assistant",
        content: aiResponseText,
        timestamp: new Date(savedAssistantMsg.timestamp),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error in chat flow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = async () => {
    const newConv = await createConversation(`Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    setConversationsList(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
  };

  const clearChat = async () => {
    if (!activeConversationId) return;
    try {
      await clearChatHistory(activeConversationId);
      const updatedList = conversationsList.filter(c => c.id !== activeConversationId);
      setConversationsList(updatedList);
      
      if (updatedList.length > 0) {
        setActiveConversationId(updatedList[0].id);
      } else {
        const newConv = await createConversation("Nueva conversación");
        setConversationsList([newConv]);
        setActiveConversationId(newConv.id);
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  return {
    messages,
    conversationsList,
    activeConversationId,
    isLoading,
    sendMessage,
    clearChat,
    startNewChat,
    setActiveConversationId
  };
}
