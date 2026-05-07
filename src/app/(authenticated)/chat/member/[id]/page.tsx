"use client";

import { use } from "react";
import { RealtimeChatView } from "@/modules/chat/views/realtime-chat-view";

export default function MemberChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const conversationId = parseInt(resolvedParams.id);

  return (
    <RealtimeChatView 
      conversationId={conversationId} 
      title="Mi Especialista"
      subtitle="Sesión de Chat Privada"
      userRole="user" // El usuario actúa como 'user'
    />
  );
}
