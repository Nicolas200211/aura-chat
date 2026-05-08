"use client";

import { Heart, Sparkles, MessageCircle, BarChart3, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export const WelcomeView = () => {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-between p-8 bg-gradient-to-br from-[#E7E6FF] via-[#E8F6FF] to-[#E8FFF6] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center w-full px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="w-44 h-44 rounded-[2.5rem] bg-white dark:bg-zinc-900 flex items-center justify-center relative overflow-hidden shadow-2xl border-4 border-white dark:border-white/10">
            <img src="/image/logo/logo_mente_en_calma.png" alt="Aura Logo" className="w-full h-full object-cover" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-4"
          >
            <Sparkles className="w-12 h-12 text-[#B7B1F2]" />
          </motion.div>
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#928EFF] to-[#88D6D1] bg-clip-text text-transparent">
            Aura Chat
          </h1>
          <p className="text-zinc-600 font-medium text-lg">
            Tu espacio de calma digital.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs mb-12">
        <Link href="/auth/login" className="w-full">
          <Button className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-[#928EFF]/20">
            Iniciar Sesión
          </Button>
        </Link>
        <Link href="/auth/register" className="w-full">
          <Button variant="outline" className="w-full h-14 text-lg rounded-2xl border-2">
            Comenzar ahora
          </Button>
        </Link>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <motion.div
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="flex items-center gap-3 text-zinc-700 font-medium"
  >
    <div className="text-[#928EFF]">{icon}</div>
    <span>{text}</span>
  </motion.div>
);
