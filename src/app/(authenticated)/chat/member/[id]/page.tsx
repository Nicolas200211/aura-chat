"use client";

import { use, useEffect, useState } from "react";
import { RealtimeChatView } from "@/modules/chat/views/realtime-chat-view";
import { getConversationDetails } from "@/app/actions/chat-actions";

export default function MemberChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const conversationId = parseInt(resolvedParams.id);
  const [details, setDetails] = useState<{title: string, subtitle: string, avatar?: string | null}>({
    title: "Cargando...",
    subtitle: "Iniciando chat...",
    avatar: null
  });

  useEffect(() => {
    const fetchDetails = async () => {
      const data = await getConversationDetails(conversationId);
      if (data) setDetails(data);
    };
    fetchDetails();
  }, [conversationId]);

  return (
    <RealtimeChatView 
      conversationId={conversationId} 
      title={details.title}
      subtitle={details.subtitle}
      avatar={details.avatar}
      userRole="user" 
    />
  );
}
