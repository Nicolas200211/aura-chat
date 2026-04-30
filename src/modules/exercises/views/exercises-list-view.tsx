"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  Wind,
  Moon,
  Sun,
  Zap,
  Timer,
  Activity,
  Play
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const EXERCISES = [
  {
    id: "LOG-BREATH",
    title: "Respiración 4-4-6",
    desc: "Reducción de ansiedad instantánea.",
    duration: "05 MIN",
    icon: <Wind className="w-5 h-5" />,
    color: "bg-[#FFC3A0]",
    href: "/exercises/breathing",
    category: "Respiración",
    metric: "VITAL_SYNC_01",
  },
  {
    id: "LOG-SLEEP",
    title: "Meditación Sueño",
    desc: "Optimización de descanso profundo.",
    duration: "10 MIN",
    icon: <Moon className="w-5 h-5" />,
    color: "bg-[#B7B1F2]",
    href: "/exercises/meditation-sleep",
    category: "Meditación",
    metric: "REST_OPT_04",
  },
  {
    id: "LOG-YOGA",
    title: "Yoga Matutino",
    desc: "Activación muscular progresiva.",
    duration: "15 MIN",
    icon: <Sun className="w-5 h-5" />,
    color: "bg-[#A7E6D7]",
    href: "/exercises/morning-yoga",
    category: "Yoga",
    metric: "FLOW_STATE_02",
  },
  {
    id: "LOG-FOCUS",
    title: "Foco Rápido",
    desc: "Concentración de alto nivel.",
    duration: "03 MIN",
    icon: <Zap className="w-5 h-5" />,
    color: "bg-blue-400",
    href: "/exercises/quick-focus",
    category: "Enfoque",
    metric: "CORE_MIND_09",
  }
];

export const ExercisesListView = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FE] dark:bg-slate-950 p-5 pb-24 selection:bg-[#B7B1F2]/30 max-w-md mx-auto overflow-x-hidden font-sans">
      <header className="mb-8 pt-6 flex justify-between items-end px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => router.back()}
              className="text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Training_Database v2.0</span>
          </div>
          <h1 className="text-3xl font-black text-zinc-800 dark:text-white tracking-tight">Ejercicios</h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-col gap-4">
        {/* Active Status Bento Card */}
        <div className="bg-[#A7E6D7]/10 p-5 rounded-2xl border border-[#A7E6D7]/20 flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#A7E6D7] flex items-center justify-center text-white shadow-lg shadow-[#A7E6D7]/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] text-[#A7E6D7] font-bold uppercase tracking-widest">Estado_Sistema</p>
              <p className="text-[10px] text-emerald-600 dark:text-[#A7E6D7]/80 font-mono mt-0.5 font-bold">DISPONIBLE_PARA_SESIÓN</p>
            </div>
          </div>
          <div className="flex gap-1">
            <span className="w-1 h-1 rounded-full bg-[#A7E6D7] animate-pulse" />
            <span className="w-1 h-1 rounded-full bg-[#A7E6D7] animate-pulse [animation-delay:200ms]" />
          </div>
        </div>

        {/* Vertical List of Exercises */}
        <div className="flex flex-col gap-4">
          {EXERCISES.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => router.push(ex.href)}
              className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-2xl flex flex-col group cursor-pointer transition-all duration-300 hover:border-[#B7B1F2]/30 active:scale-[0.98]"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-xl relative overflow-hidden shrink-0",
                  ex.color
                )}>
                  <div className="absolute inset-0 bg-black/5" />
                  <div className="relative z-10">{ex.icon}</div>
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-[#B7B1F2] uppercase tracking-[0.2em]">{ex.category}</span>
                    <span className="text-zinc-200 dark:text-zinc-800">•</span>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase">{ex.id}</span>
                  </div>
                  <h3 className="text-xl font-black text-zinc-800 dark:text-white leading-tight tracking-tight">
                    {ex.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-zinc-50 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-white/5">
                    <Timer className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300">{ex.duration}</span>
                  </div>
                  <div className="text-[9px] font-mono font-bold text-[#B7B1F2] uppercase tracking-widest hidden sm:block">
                    {ex.metric}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-600 uppercase group-hover:text-[#B7B1F2] transition-all">Iniciar</span>
                  <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-slate-950 flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:bg-[#B7B1F2] transition-all">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};
