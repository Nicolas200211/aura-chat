import { ChatView } from "@/modules/chat/views/chat-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat con Aura | Aura Chat",
  description: "Conversa con Aura, tu asistente inteligente para el bienestar emocional.",
};

export default function ChatPage() {
  return <ChatView />;
}
