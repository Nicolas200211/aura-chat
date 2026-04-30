"use client";

import { ChevronLeft, Trash2, Heart, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  onClear?: () => void;
}

export const ChatHeader = ({ onClear }: ChatHeaderProps) => {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between p-6 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-white/5 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-all bg-zinc-50 dark:bg-slate-950 rounded-xl border border-zinc-100 dark:border-white/5"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-[#B7B1F2] flex items-center justify-center shadow-lg shadow-[#B7B1F2]/20">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#A7E6D7] rounded-full border-2 border-white dark:border-zinc-900 shadow-sm" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-800 dark:text-white leading-none tracking-tight">Aura AI</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A7E6D7] animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">CORE_ENCRYPTED</span>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={onClear}
        className="p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-all bg-zinc-50 dark:bg-slate-950 rounded-xl border border-zinc-100 dark:border-white/5"
        title="Eliminar conversación"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </header>
  );
};
