"use client";

import { Message } from "../interfaces/message.interface";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isAssistant = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full mb-6",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] p-4 shadow-2xl relative",
          isAssistant
            ? "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 rounded-2xl rounded-tl-none border border-zinc-100 dark:border-white/5"
            : "bg-[#B7B1F2] text-white rounded-2xl rounded-tr-none shadow-[#B7B1F2]/10"
        )}
      >
        {isAssistant && (
          <div className="text-[9px] font-mono font-bold text-[#B7B1F2] uppercase tracking-[0.2em] mb-2">
            AURA_DECRYPTED
          </div>
        )}
        <p className={cn(
          "text-sm leading-relaxed whitespace-pre-wrap font-medium",
          !isAssistant && "text-white"
        )}>
          {message.content}
        </p>
        <div className="mt-3 flex items-center justify-end">
          <span
            className={cn(
              "text-[9px] font-mono font-bold tracking-widest",
              isAssistant ? "text-zinc-400" : "text-white/60"
            )}
          >
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
