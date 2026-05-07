"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRealtimeChat } from "../hooks/use-realtime-chat";
import { ChatBubble } from "../components/chat-bubble";
import { cn } from "@/lib/utils";

interface RealtimeChatViewProps {
  conversationId: number;
  title: string;
  subtitle?: string;
  userRole: 'user' | 'assistant';
}

export const RealtimeChatView = ({ conversationId, title, subtitle, userRole }: RealtimeChatViewProps) => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage } = useRealtimeChat(conversationId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue, userRole);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FE] dark:bg-slate-950 overflow-hidden">
      {/* Header Minimalista y Elegante */}
      <header className="bg-white dark:bg-zinc-900 px-6 py-4 flex items-center gap-4 border-b border-zinc-100 dark:border-white/5 shadow-sm">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-500" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#B7B1F2] flex items-center justify-center text-white shadow-lg shadow-[#B7B1F2]/20">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-zinc-800 dark:text-white leading-tight uppercase tracking-tight">{title}</h1>
            <p className="text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-widest">{subtitle || "En Línea"}</p>
          </div>
        </div>
      </header>

      {/* Área de Mensajes */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar"
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <ChatBubble 
              key={msg.id} 
              message={{
                ...msg,
                role: msg.role === userRole ? 'user' : 'assistant' // Adaptamos para que ChatBubble sepa si es propio o ajeno
              }} 
            />
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="text-center py-4">
             <span className="text-[10px] font-mono text-zinc-400 animate-pulse">SINCRONIZANDO_HISTORIAL...</span>
          </div>
        )}
      </main>

      {/* Input de Chat */}
      <footer className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-white/5">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-zinc-100 dark:bg-slate-950 border border-zinc-200 dark:border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[#B7B1F2] transition-all text-zinc-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-14 h-14 bg-[#B7B1F2] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#B7B1F2]/30 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </footer>
    </div>
  );
};
