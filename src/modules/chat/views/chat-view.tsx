"use client";

import { useState, useEffect, useRef } from "react";
import { ChatHeader } from "../components/chat-header";
import { ChatBubble } from "../components/chat-bubble";
import { ChatInput } from "../components/chat-input";
import { useChat } from "../hooks/use-chat";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MessageSquare, Clock, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const ChatView = () => {
  const {
    messages,
    conversationsList,
    activeConversationId,
    isLoading,
    sendMessage,
    clearChat,
    startNewChat,
    setActiveConversationId
  } = useChat();

  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'chat' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, activeTab]);

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FE] dark:bg-slate-950 selection:bg-[#B7B1F2]/30 overflow-hidden">
      <ChatHeader onClear={clearChat} />

      {/* Selector de Pestañas y Nuevo Chat */}
      <div className="px-6 py-2 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-white/5 flex gap-2 items-center">
        <div className="flex-1 flex gap-2 bg-zinc-100 dark:bg-slate-950 p-1 rounded-2xl border border-zinc-200 dark:border-white/5">
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest",
              activeTab === 'chat'
                ? "bg-white dark:bg-zinc-800 text-[#B7B1F2] shadow-sm"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest",
              activeTab === 'history'
                ? "bg-white dark:bg-zinc-800 text-[#B7B1F2] shadow-sm"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            Historial
          </button>
        </div>

        <button
          onClick={() => {
            startNewChat();
            setActiveTab('chat');
          }}
          className="p-3 bg-[#B7B1F2] text-white rounded-2xl shadow-lg shadow-[#B7B1F2]/30 hover:scale-105 active:scale-95 transition-all"
          title="Nuevo Chat"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 scroll-smooth no-scrollbar"
      >
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' ? (
              <motion.div
                key="chat-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                {messages.map((message) => (
                  <ChatBubble key={message.id} message={message} />
                ))}

                {isLoading && (
                  <div className="flex justify-start mb-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl rounded-tl-none px-6 py-4 border border-zinc-100 dark:border-white/5 shadow-2xl">
                      <div className="flex gap-1.5 items-center">
                        <span className="w-1.5 h-1.5 bg-[#B7B1F2] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-[#B7B1F2] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-[#B7B1F2] rounded-full animate-bounce" />
                        <span className="text-[9px] font-mono font-black text-[#B7B1F2] ml-3 uppercase tracking-widest">Aura_Escribiendo...</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid gap-4"
              >
                <div className="flex items-center gap-3 mb-2 px-2">
                  <div className="w-2 h-2 rounded-full bg-[#B7B1F2]" />
                  <h3 className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">Tus_Conversaciones_Pasadas</h3>
                </div>

                {conversationsList.length > 0 ? (
                  conversationsList.map((conv: any) => (
                    <motion.div
                      whileHover={{ x: 5 }}
                      key={conv.id}
                      onClick={() => {
                        setActiveConversationId(conv.id);
                        setActiveTab('chat');
                      }}
                      className={cn(
                        "p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group",
                        activeConversationId === conv.id
                          ? "bg-white dark:bg-zinc-800 border-[#B7B1F2] shadow-xl shadow-[#B7B1F2]/10"
                          : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 hover:border-[#B7B1F2]/30"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                          activeConversationId === conv.id ? "bg-[#B7B1F2] text-white" : "bg-zinc-50 dark:bg-slate-950 text-zinc-400 group-hover:text-[#B7B1F2]"
                        )}>
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-zinc-800 dark:text-white group-hover:text-[#B7B1F2] transition-colors">{conv.title}</h4>
                          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mt-1">
                            {new Date(conv.createdAt).toLocaleDateString()} • {new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-[#B7B1F2] transition-colors" />
                    </motion.div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <Calendar className="w-12 h-12 text-zinc-200 dark:text-white/5 mx-auto mb-4" />
                    <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">No hay chats_previos</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {activeTab === 'chat' && (
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      )}
    </div>
  );
};
