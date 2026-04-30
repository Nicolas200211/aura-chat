"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Play, Pause, RotateCcw, Wind, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type BreathState = "Inhala" | "Retén" | "Exhala";

export const BreathingView = () => {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(4);
  const [breathState, setBreathState] = useState<BreathState>("Inhala");
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    let interval: any;

    if (isActive) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            if (breathState === "Inhala") {
              setBreathState("Retén");
              return 4;
            } else if (breathState === "Retén") {
              setBreathState("Exhala");
              return 6;
            } else {
              setBreathState("Inhala");
              setCycle((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, breathState]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimer(4);
    setBreathState("Inhala");
    setCycle(0);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FE] dark:bg-slate-950 text-zinc-400 font-sans p-6 selection:bg-[#FFC3A0]/30">
      <header className="mb-8 pt-8 flex justify-between items-end">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-all bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-white/5 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-zinc-800 dark:text-white tracking-tight">Respiración</h1>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.2em] mt-0.5">SISTEMA_VITAL_v1.0</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#FFC3A0]/10 flex items-center justify-center text-[#FFC3A0] border border-[#FFC3A0]/20">
          <Wind className="w-5 h-5" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center">
        {/* Bento Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl p-10 shadow-2xl border border-zinc-50 dark:border-white/5 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC3A0]/20">
            <motion.div 
              className="h-full bg-[#FFC3A0]"
              initial={{ width: "0%" }}
              animate={{ width: isActive ? "100%" : "0%" }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.3em] mb-12">
            Protocolo_4-4-6
          </div>

          {/* Animation Circle */}
          <div className="relative flex items-center justify-center mb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={breathState}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: breathState === "Inhala" ? 1.3 : breathState === "Retén" ? 1.3 : 0.8, 
                  opacity: 1 
                }}
                transition={{ 
                  duration: breathState === "Inhala" ? 4 : breathState === "Retén" ? 4 : 6,
                  ease: "easeInOut"
                }}
                className="w-56 h-56 rounded-full bg-[#FFC3A0]/10 flex flex-col items-center justify-center border border-[#FFC3A0]/20 shadow-[0_0_50px_rgba(255,195,160,0.1)]"
              />
            </AnimatePresence>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                key={timer}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-7xl font-mono font-black text-zinc-800 dark:text-white"
              >
                {timer}
              </motion.span>
              <div className="h-4 flex items-center">
                <span className="text-[10px] font-black text-[#FFC3A0] uppercase tracking-[0.2em] mt-2">
                  {breathState}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6 w-full">
            <button 
              onClick={toggleTimer}
              className={cn(
                "w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95",
                isActive 
                  ? "bg-zinc-100 dark:bg-slate-950 text-zinc-500 border border-zinc-200 dark:border-white/5" 
                  : "bg-[#FFC3A0] text-white shadow-[#FFC3A0]/20"
              )}
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  Pausar_Sistema
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Iniciar_Sesión
                </>
              )}
            </button>

            {isActive && (
               <button 
               onClick={resetTimer}
               className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:text-[#FFC3A0] transition-colors"
             >
               <RotateCcw className="w-4 h-4" />
               Reiniciar_Buffer
             </button>
            )}

            <div className="pt-6 border-t border-zinc-50 dark:border-white/5">
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed max-w-[220px] mx-auto uppercase tracking-tighter">
                Sincroniza tu ritmo para reducir el ruido mental.
              </p>
            </div>
          </div>
        </motion.div>

        {cycle > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 bg-white dark:bg-zinc-900 px-8 py-4 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-xl flex items-center gap-4"
          >
            <div className="w-8 h-8 rounded-lg bg-[#A7E6D7]/20 flex items-center justify-center text-[#A7E6D7]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
              Ciclos_Completados: <span className="text-[#FFC3A0] text-sm">{cycle}</span>
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
};
