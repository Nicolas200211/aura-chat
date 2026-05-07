"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger"
}: ConfirmModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-5"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-xs rounded-2xl p-6 shadow-2xl border border-zinc-100 dark:border-white/10 text-center"
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4",
              variant === "danger" ? "bg-rose-500/10 text-rose-500" :
              variant === "warning" ? "bg-amber-500/10 text-amber-500" :
              "bg-[#B7B1F2]/10 text-[#B7B1F2]"
            )}>
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <h2 className="text-lg font-black text-zinc-800 dark:text-white mb-2 tracking-tight">
              {title}
            </h2>
            
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              {description}
            </p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onConfirm();
                }}
                className={cn(
                  "w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all text-white",
                  variant === "danger" ? "bg-rose-500 shadow-rose-500/20" :
                  variant === "warning" ? "bg-amber-500 shadow-amber-500/20" :
                  "bg-[#B7B1F2] shadow-[#B7B1F2]/20"
                )}
              >
                {confirmText}
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-3 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-800 dark:hover:text-white transition-colors"
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
