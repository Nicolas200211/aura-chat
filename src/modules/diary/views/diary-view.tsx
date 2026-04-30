"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Plus,
  Search,
  Calendar,
  Smile,
  Frown,
  AlertCircle,
  MoreVertical,
  Save,
  Trash2,
  BookOpen,
  Activity,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getJournalEntries, saveJournalEntry } from "@/app/actions/content-actions";

export const DiaryView = () => {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newMood, setNewMood] = useState<string>("feliz");

  // Cargar entradas al montar el componente
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const data = await getJournalEntries();
      setEntries(data);
    } catch (error) {
      console.error("Error al cargar entradas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newContent.trim()) return;

    try {
      const result = await saveJournalEntry(newContent, newMood);
      const savedEntry = result[0];

      setEntries([savedEntry, ...entries]);
      setIsAdding(false);
      setNewTitle("");
      setNewContent("");
    } catch (error) {
      console.error("Error al guardar entrada:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FE] dark:bg-slate-950 text-zinc-400 font-sans p-5 pb-24 selection:bg-[#B7B1F2]/30 max-w-md mx-auto overflow-x-hidden">
      <header className="mb-8 pt-6 flex justify-between items-end px-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">EMOTIONAL_LOG_v1.0</span>
          </div>
          <h1 className="text-3xl font-black text-zinc-800 dark:text-white tracking-tight">Mi Diario</h1>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 flex items-center justify-center text-zinc-400 dark:text-white shadow-sm">
          <BookOpen className="w-5 h-5" />
        </div>
      </header>

      <main className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em]">Entradas_Recientes</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-[#A7E6D7] text-emerald-900 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#A7E6D7]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nuevo_Log
          </motion.button>
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-[#B7B1F2] animate-spin" />
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Sincronizando_DB...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No hay registros aún.</p>
              </div>
            ) : (
              entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-2xl relative group cursor-pointer hover:border-[#B7B1F2]/20 transition-all"
                >
                  <div className={cn(
                    "absolute left-0 top-6 bottom-6 w-1 rounded-r-full",
                    entry.mood === "feliz" ? "bg-[#A7E6D7]" :
                      entry.mood === "triste" ? "bg-[#B7B1F2]" : "bg-[#FFC3A0]"
                  )} />

                  <div className="flex justify-between items-start mb-4 pl-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-[9px] font-mono font-bold uppercase tracking-widest",
                          entry.mood === "feliz" ? "text-emerald-500" :
                            entry.mood === "triste" ? "text-[#B7B1F2]" : "text-[#FFC3A0]"
                        )}>
                          {entry.mood}
                        </span>
                        <span className="text-zinc-200 dark:text-zinc-800">•</span>
                        <span className="text-[9px] font-mono text-zinc-400">LOG-{entry.id.toString().slice(0, 3)}</span>
                      </div>
                      <h3 className="text-lg font-black text-zinc-800 dark:text-white tracking-tight">Registro_Emocional</h3>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 font-bold uppercase">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed pl-2 font-medium">
                    {entry.content}
                  </p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl p-8 shadow-2xl border border-zinc-100 dark:border-white/10"
            >
              <h2 className="text-xl font-black text-zinc-800 dark:text-white mb-8 tracking-tight uppercase">Nuevo_Registro</h2>

              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em] mb-3 block">Título_Entrada</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="DESC_BREVE..."
                    className="w-full bg-[#F8F9FE] dark:bg-slate-950 border border-zinc-100 dark:border-white/10 rounded-xl px-4 py-3 text-[11px] font-mono text-[#B7B1F2] focus:outline-none focus:border-[#B7B1F2]/50 placeholder:text-zinc-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em] mb-3 block">Contenido_Mental</label>
                  <textarea
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="BUFFER_DATA_INPUT..."
                    className="w-full bg-[#F8F9FE] dark:bg-slate-950 border border-zinc-100 dark:border-white/10 rounded-xl px-4 py-3 text-[11px] font-mono text-[#B7B1F2] focus:outline-none focus:border-[#B7B1F2]/50 placeholder:text-zinc-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em] mb-4 block">Mood_State</label>
                  <div className="flex gap-3">
                    <MoodSelector
                      active={newMood === "feliz"}
                      onClick={() => setNewMood("feliz")}
                      icon={<Smile className="w-5 h-5" />}
                      color="bg-[#A7E6D7]"
                    />
                    <MoodSelector
                      active={newMood === "triste"}
                      onClick={() => setNewMood("triste")}
                      icon={<Frown className="w-5 h-5" />}
                      color="bg-[#B7B1F2]"
                    />
                    <MoodSelector
                      active={newMood === "ansioso"}
                      onClick={() => setNewMood("ansioso")}
                      icon={<AlertCircle className="w-5 h-5" />}
                      color="bg-[#FFC3A0]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-6 border-t border-zinc-50 dark:border-white/5">
                  <button
                    onClick={handleSave}
                    className="w-full bg-[#B7B1F2] text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#B7B1F2]/20 active:scale-95 transition-all"
                  >
                    Guardar_Log
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="w-full py-3 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Cancelar_Operación
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MoodSelector = ({ active, onClick, icon, color }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 p-4 rounded-xl flex items-center justify-center transition-all border",
      active
        ? cn(color, "text-white border-transparent shadow-lg scale-105")
        : "bg-[#F8F9FE] dark:bg-slate-950 text-zinc-400 border-zinc-100 dark:border-white/5"
    )}
  >
    {icon}
  </button>
);
