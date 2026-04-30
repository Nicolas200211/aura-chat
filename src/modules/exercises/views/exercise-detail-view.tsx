"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Play, Pause, RotateCcw, CheckCircle2, Wind, Moon, Sun, Zap, Activity, Timer as TimerIcon } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

const EXERCISE_CONFIGS: any = {
  "breathing": {
    title: "Respiración 4-4-6",
    color: "from-[#FFC3A0] to-[#FF8E91]",
    accent: "#FFC3A0",
    id: "LOG-BREATH",
    icon: <Wind className="w-8 h-8" />,
    steps: [
      { text: "Inhala profundamente", duration: 4, type: "Inhala" },
      { text: "Mantén el aire", duration: 4, type: "Retén" },
      { text: "Exhala suavemente", duration: 6, type: "Exhala" }
    ],
    desc: "Sincronización vital para calma instantánea."
  },
  "meditation-sleep": {
    title: "Meditación Sueño",
    color: "from-[#B7B1F2] to-[#928EFF]",
    accent: "#B7B1F2",
    id: "LOG-SLEEP",
    icon: <Moon className="w-8 h-8" />,
    steps: [
      { text: "Cierra los ojos", duration: 10, type: "Relájate" },
      { text: "Escaneo corporal", duration: 10, type: "Enfócate" }
    ],
    desc: "Optimización de descanso profundo."
  },
  "morning-yoga": {
    title: "Yoga Matutino",
    color: "from-[#A7E6D7] to-[#88D6D1]",
    accent: "#A7E6D7",
    id: "LOG-YOGA",
    icon: <Sun className="w-8 h-8" />,
    steps: [
      { text: "Estiramiento basal", duration: 15, type: "Estira" },
      { text: "Flujo solar", duration: 15, type: "Mueve" }
    ],
    desc: "Activación muscular progresiva."
  },
  "quick-focus": {
    title: "Foco Rápido",
    color: "from-amber-400 to-amber-600",
    accent: "#fbbf24",
    id: "LOG-FOCUS",
    icon: <Zap className="w-8 h-8" />,
    steps: [
      { text: "Punto de anclaje", duration: 3, type: "Enfoca" },
      { text: "Limpieza de buffer", duration: 3, type: "Limpia" }
    ],
    desc: "Concentración de alto nivel."
  }
};

export const ExerciseDetailView = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const config = EXERCISE_CONFIGS[id] || EXERCISE_CONFIGS["breathing"];

  const [isActive, setIsActive] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [timer, setTimer] = useState(config.steps[0].duration);
  const [cycle, setCycle] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && !isFinished) {
      interval = setInterval(() => {
        setTimer((prev: number) => {
          if (prev <= 1) {
            const nextIdx = (currentStepIdx + 1) % config.steps.length;
            if (nextIdx === 0) setCycle(c => c + 1);

            if (cycle >= 10 && nextIdx === 0) {
              setIsFinished(true);
              setIsActive(false);
              return 0;
            }

            setCurrentStepIdx(nextIdx);
            return config.steps[nextIdx].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, currentStepIdx, config, cycle, isFinished]);

  const currentStep = config.steps[currentStepIdx];

  return (
    <div className={cn("flex flex-col min-h-screen text-white overflow-hidden bg-gradient-to-b transition-colors duration-1000", config.color)}>
      <header className="p-6 pt-10 flex items-center justify-between z-10">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-colors border border-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-[9px] font-mono font-bold opacity-60 uppercase tracking-[0.3em] mb-1">{config.id}</p>
          <h1 className="text-xl font-black tracking-tight">{config.title}</h1>
        </div>
        <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl border border-white/10">
          {config.icon}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <div className="w-full flex flex-col items-center gap-8">
              <div className="relative flex items-center justify-center">
                {/* Visualizer Rings */}
                <motion.div
                  animate={{ scale: isActive ? [1, 1.6, 1] : 1, opacity: isActive ? [0.1, 0.05, 0.1] : 0 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-64 h-64 rounded-full border-2 border-white/20"
                />

                <motion.div
                  animate={{
                    scale: isActive && currentStep.type === "Inhala" ? 1.3 : isActive && currentStep.type === "Exhala" ? 0.9 : 1,
                  }}
                  transition={{ duration: currentStep.duration, ease: "easeInOut" }}
                  className="w-52 h-52 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.1)]"
                >
                  <motion.span
                    key={timer}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl font-mono font-black tracking-tighter"
                  >
                    {timer}
                  </motion.span>
                  <div className="h-6 flex items-center justify-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mt-2">{currentStep.type}</span>
                  </div>
                </motion.div>
              </div>

              <div className="text-center space-y-2">
                <motion.h2
                  key={currentStep.text}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-lg font-black tracking-tight uppercase leading-tight"
                >
                  {currentStep.text}
                </motion.h2>
                <div className="flex items-center justify-center gap-4 py-3 px-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono opacity-60 uppercase tracking-widest">Ciclo</span>
                    <span className="text-sm font-mono font-black">{cycle}</span>
                  </div>
                  <div className="w-px h-6 bg-white/20" />
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono opacity-60 uppercase tracking-widest">Protocolo</span>
                    <span className="text-sm font-mono font-black">SYNC_0{currentStepIdx + 1}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white text-zinc-900 w-full max-w-xs rounded-2xl p-10 flex flex-col items-center gap-6 shadow-2xl border border-white/20"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">Completado</h2>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest leading-relaxed">
                  Has completado {cycle} ciclos de {config.title} con éxito.
                </p>
              </div>
              <button
                onClick={() => router.back()}
                className={cn("w-full py-5 rounded-xl text-white text-[11px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95", config.color)}
              >
                Cerrar Sesión
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!isFinished && (
        <footer className="p-10 flex flex-col items-center gap-8 z-10">
          <div className="flex items-center gap-10">
            <button
              onClick={() => { setIsActive(false); setTimer(config.steps[0].duration); setCurrentStepIdx(0); setCycle(0); }}
              className="p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all active:scale-90"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsActive(!isActive)}
              className="w-16 h-16 bg-white text-zinc-900 rounded-2xl flex items-center justify-center shadow-[0_20px_50px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-90 transition-all border-4 border-white/20"
            >
              {isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>
            <div className="w-14 h-14 flex flex-col items-center justify-center bg-white/10 rounded-2xl border border-white/10">
              <span className="text-[8px] font-mono font-bold opacity-60 uppercase">VITAL</span>
              <span className="text-sm font-mono font-black">{cycle}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 opacity-40 animate-pulse" />
            <p className="text-[9px] font-mono font-bold opacity-40 uppercase tracking-[0.3em]">AURA_CORE_V4.0</p>
          </div>
        </footer>
      )}
    </div>
  );
};
