"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Star, Zap, Search, SlidersHorizontal, ChevronRight, Wind, Heart, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { getExercises } from "@/app/actions/content-actions";

export const ExercisesView = () => {
  const [exerciseList, setExerciseList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await getExercises();
      setExerciseList(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const featured = exerciseList[0];
  const others = exerciseList.slice(1);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FE] dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#B7B1F2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">Sincronizando_Contenido...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FE] dark:bg-slate-950 text-zinc-400 font-sans p-5 pb-24 selection:bg-[#B7B1F2]/30 max-w-md mx-auto">
      <header className="mb-8 pt-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-zinc-800 dark:text-white tracking-tight">Ejercicios</h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mt-1">TRAINING_MODULE_v2.0</p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 flex items-center justify-center text-zinc-400 dark:text-white shadow-sm">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Featured Exercise Card - Full Width */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-2 bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-2xl border border-zinc-100 dark:border-[#B7B1F2]/20 overflow-hidden relative group cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wind className="w-32 h-32 text-[#B7B1F2] -mr-8 -mt-8" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 rounded-2xl bg-[#B7B1F2] flex items-center justify-center text-white shadow-xl shadow-[#B7B1F2]/20">
                  <Play className="fill-white w-6 h-6 ml-1" />
                </div>
                <div className="px-3 py-1.5 bg-[#A7E6D7]/10 border border-[#A7E6D7]/20 rounded-xl">
                  <span className="text-[9px] font-mono font-black text-[#A7E6D7] uppercase tracking-widest">{featured.category.toUpperCase()}</span>
                </div>
              </div>
              <h2 className="text-2xl font-black text-zinc-800 dark:text-white leading-tight mb-2 tracking-tighter">
                {featured.title}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono font-bold text-zinc-400">DIFICULTAD: {featured.difficulty.toUpperCase()}</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#B7B1F2]" />
                  <span className="text-[10px] font-mono font-bold text-zinc-500">{featured.duration}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards - Half Width */}
        <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] p-5 shadow-xl border border-zinc-100 dark:border-white/5 flex flex-col justify-between h-36">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1">PROMEDIO</p>
            <p className="text-xl font-mono font-black text-zinc-800 dark:text-white">72 BPM</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] p-5 shadow-xl border border-zinc-100 dark:border-white/5 flex flex-col justify-between h-36">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 border border-sky-500/20">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1">ENFOQUE</p>
            <p className="text-xl font-mono font-black text-zinc-800 dark:text-white">88%</p>
          </div>
        </div>

        {/* List of Other Exercises - Full Width Vertical List */}
        <div className="col-span-2 flex flex-col gap-3 mt-2">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2 ml-1">CATÁLOGO_TOTAL</h3>
          {others.map((exercise) => (
            <motion.div
              key={exercise.id}
              whileTap={{ scale: 0.98 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-4 flex items-center gap-4 border border-zinc-50 dark:border-white/5 shadow-lg group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-[#B7B1F2] shadow-sm">
                <Play className="fill-current w-4 h-4 ml-0.5" />
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-black text-zinc-800 dark:text-white tracking-tight">
                  {exercise.title}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px] font-mono text-zinc-400">{exercise.category}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#B7B1F2]" />
                    <span className="text-[9px] font-mono font-bold text-zinc-400">{exercise.duration}</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-[#B7B1F2] transition-all" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
