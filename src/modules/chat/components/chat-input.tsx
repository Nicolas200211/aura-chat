"use client";

import { useState } from "react";
import { SendHorizontal, Paperclip, Mic } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-white/5">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center gap-3">
        <div className="flex-1 relative flex items-center group">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Sincronizar mensaje con Aura..."
            className="w-full h-14 bg-zinc-50 dark:bg-slate-950 border border-zinc-100 dark:border-white/10 rounded-2xl px-6 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#B7B1F2]/50 transition-all font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            disabled={isLoading}
          />
          <div className="absolute right-4 text-[9px] font-mono text-zinc-300 dark:text-zinc-700 font-bold uppercase tracking-widest hidden sm:block">
            UTF-8_READY
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          type="submit"
          disabled={!message.trim() || isLoading}
          className="h-14 px-6 bg-[#B7B1F2] text-white rounded-2xl shadow-xl shadow-[#B7B1F2]/20 flex items-center justify-center disabled:opacity-50 transition-all shrink-0 gap-2 font-black text-[10px] uppercase tracking-widest"
        >
          <span className="hidden sm:inline">Enviar</span>
          <SendHorizontal className="w-5 h-5" />
        </motion.button>
      </form>
    </div>
  );
};
