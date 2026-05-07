"use client";

import { use } from "react";
import { RealtimeChatView } from "@/modules/chat/views/realtime-chat-view";

export default function SpecialistChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const conversationId = parseInt(resolvedParams.id);

  return (
    <RealtimeChatView 
      conversationId={conversationId} 
      title="Canal del Especialista"
      subtitle="Chat Directo con Paciente"
      userRole="assistant" // El psicólogo actúa como 'assistant' en la estructura de mensajes
    />
  );
}
