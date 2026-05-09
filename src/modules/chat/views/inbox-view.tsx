"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ArrowLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { getUserConversations, getSpecialistConversations, getUnreadCountsPerConversation } from "@/app/actions/chat-actions";
import { getMyProfile } from "@/app/actions/content-actions";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const InboxView = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string>("usuario");
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});

  const refreshUnread = async () => {
    const counts = await getUnreadCountsPerConversation();
    setUnreadCounts(counts);
  };

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      try {
        const profile = await getMyProfile();
        const userRole = profile?.role || "usuario";
        setRole(userRole);

        const data = userRole === "psicologo"
          ? await getSpecialistConversations()
          : await getUserConversations();

        setConversations(data);
      } catch (error) {
        console.error("Error loading inbox:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
    refreshUnread();

    const channel = supabase
      .channel("notifications:global")
      .on("broadcast", { event: "new-notification" }, refreshUnread)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FE] dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-[#B7B1F2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FE] dark:bg-slate-950 p-6">
      <header className="flex items-center gap-4 mb-8 pt-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 flex items-center justify-center text-zinc-500 shadow-sm transition-transform active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-zinc-800 dark:text-white tracking-tight leading-tight uppercase italic">Mis Mensajes</h1>
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Centro de Comunicación Directa</p>
        </div>
      </header>

      <div className="space-y-4">
        {/* Acceso rápido a Aura AI para usuarios */}
        {role === "usuario" && (
           <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/chat')}
            className="bg-gradient-to-br from-[#B7B1F2] to-[#928EFF] p-5 rounded-3xl shadow-xl shadow-[#B7B1F2]/20 flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-white text-sm uppercase tracking-tight">Asistente Aura AI</h4>
                <p className="text-white/70 text-[10px] font-mono uppercase tracking-widest mt-1">Chat de Apoyo 24/7</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        )}

        <div className="flex items-center gap-3 py-2 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#B7B1F2]" />
            <h3 className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-[0.2em]">
                {role === "psicologo" ? "CHATS_CON_PACIENTES" : "CHATS_CON_ESPECIALISTAS"}
            </h3>
        </div>

        <AnimatePresence mode="popLayout">
          {conversations.length > 0 ? (
            conversations.map((conv, i) => {
              const unread = unreadCounts[conv.id] ?? 0;
              const displayName = conv.specialistName || conv.patientName || "?";
              const avatarSrc = conv.specialistImage || conv.specialistAvatarUrl || conv.patientAvatar;
              const initials = displayName.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/chat/${role === 'psicologo' ? 'specialist' : 'member'}/${conv.id}`)}
                  className={cn(
                    "bg-white dark:bg-zinc-900 p-4 rounded-3xl border shadow-sm hover:shadow-md transition-all group cursor-pointer",
                    unread > 0
                      ? "border-[#B7B1F2]/30 dark:border-[#B7B1F2]/20"
                      : "border-zinc-100 dark:border-white/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#B7B1F2]/20 flex items-center justify-center">
                          <span className="text-sm font-black text-[#B7B1F2]">{initials}</span>
                        </div>
                      )}
                      {unread > 0 && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "leading-tight truncate",
                        unread > 0
                          ? "font-black text-zinc-800 dark:text-white"
                          : "font-bold text-zinc-800 dark:text-white"
                      )}>
                        {conv.specialistName || conv.patientName || "Conversación"}
                      </h4>
                      <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter mt-1">
                        {new Date(conv.createdAt).toLocaleDateString()} • {new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="relative shrink-0">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                        unread > 0
                          ? "bg-[#B7B1F2]/10 text-[#B7B1F2]"
                          : "bg-zinc-50 dark:bg-slate-950 text-zinc-300 group-hover:text-[#B7B1F2] group-hover:bg-[#B7B1F2]/10"
                      )}>
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      {unread > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 px-0.5 leading-none">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-20 text-center">
               <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-zinc-300" />
               </div>
               <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">No hay chats_activos</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
