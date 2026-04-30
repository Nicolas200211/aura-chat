"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Sparkles, Heart, Moon, Sun, BarChart3, MessageCircle, 
  BookOpen, Wind, Stethoscope, User, Smile, Frown, AlertCircle,
  Activity, Bell, Settings, ChevronRight, Loader2, Zap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid
} from "recharts";
import { getMyProfile, getDashboardStats } from "@/app/actions/content-actions";
import { InstallPWA } from "@/components/install-pwa";

export const DashboardView = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("...");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ streak: 0, totalEntries: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const profile = await getMyProfile();
      if (profile) {
        setUserName(profile.fullName || user.email?.split('@')[0] || "Usuario");
        setAvatarUrl(profile.avatarUrl || "");
      } else {
        setUserName(user.email?.split('@')[0] || "Usuario");
      }

      const dashboardStats = await getDashboardStats();
      if (dashboardStats) {
        setChartData(dashboardStats.chartData);
        setStats({
          streak: dashboardStats.streak,
          totalEntries: dashboardStats.totalEntries
        });
      }
      setIsLoading(false);
    };
    loadData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-[#B7B1F2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FE] dark:bg-slate-950 text-zinc-400 font-sans p-5 pb-24 selection:bg-[#B7B1F2]/30 max-w-md mx-auto overflow-x-hidden">
      <header className="flex justify-between items-start mb-8 pt-6 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#A7E6D7] animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">SISTEMA_ACTIVO v4.0</span>
          </div>
          <h1 className="text-3xl font-black text-zinc-800 dark:text-white tracking-tight">Hola, {userName}</h1>
        </div>
        <div className="flex gap-2 items-center">
          <InstallPWA />
          <Link href="/profile">
            <div className="w-10 h-10 rounded-xl bg-[#B7B1F2] border border-white dark:border-white/10 overflow-hidden flex items-center justify-center text-white font-black shadow-lg shadow-[#B7B1F2]/20 transition-transform active:scale-95">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName[0].toUpperCase()
              )}
            </div>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 flex justify-center gap-3 overflow-x-auto no-scrollbar pb-2">
          <MoodCard icon={<Smile className="w-5 h-5" />} label="FELIZ" color="bg-[#A7E6D7]" active />
          <MoodCard icon={<Frown className="w-5 h-5" />} label="TRISTE" color="bg-[#B7B1F2]" />
          <MoodCard icon={<AlertCircle className="w-5 h-5" />} label="ANSIOSO" color="bg-[#FFC3A0]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-50 dark:border-white/5"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">ESTADO_EMOCIONAL</p>
              <h2 className="text-lg font-black text-zinc-800 dark:text-white tracking-tight">Análisis de Flujo</h2>
            </div>
            <div className="bg-[#B7B1F2]/10 p-2 rounded-lg">
              <Activity className="w-4 h-4 text-[#B7B1F2]" />
            </div>
          </div>
          
          <div className="h-40 w-full min-h-[160px] -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B7B1F2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#B7B1F2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.1} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold', fontFamily: 'monospace' }}
                  dy={10}
                />
                <YAxis hide domain={[0, 10]} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg shadow-2xl border border-zinc-100 dark:border-white/5">
                          <p className="text-[10px] font-mono font-black text-[#B7B1F2]">{Number(payload[0].value).toFixed(1)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#B7B1F2" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-xl border border-zinc-50 dark:border-white/5 flex flex-col justify-between h-32">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1">Racha Real</p>
            <p className="text-xl font-mono font-black text-zinc-800 dark:text-white">{stats.streak} Días</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-xl border border-zinc-50 dark:border-white/5 flex flex-col justify-between h-32">
          <div className="w-8 h-8 rounded-lg bg-[#B7B1F2]/10 text-[#B7B1F2] flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1">Diarios</p>
            <p className="text-xl font-mono font-black text-zinc-800 dark:text-white">{stats.totalEntries} Logs</p>
          </div>
        </div>

        <FeatureCard 
          icon={<MessageCircle className="w-6 h-6" />} 
          title="Aura Chat" 
          desc="CORE_AI_ACTIVE" 
          color="bg-[#B7B1F2]" 
          href="/chat"
          colSpan="col-span-1"
        />
        <FeatureCard 
          icon={<Stethoscope className="w-6 h-6" />} 
          title="Terapia" 
          desc="SPEC_DIRECTORY" 
          color="bg-[#A7E6D7]" 
          href="/therapy"
          colSpan="col-span-1"
          textColor="text-emerald-950"
        />

        <Link href="/exercises" className="col-span-2">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-[#FFC3A0] to-[#FF8E91] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl cursor-pointer group border border-white/10"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Wind className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-mono font-black uppercase tracking-widest opacity-80">PROT_VITAL_SYNC</span>
              </div>
              <h3 className="text-2xl font-black mb-1 tracking-tight">Ejercicios de Respiración</h3>
              <p className="text-white/80 text-[10px] font-mono uppercase tracking-widest">Optimiza tu frecuencia</p>
            </div>
            <Sparkles className="absolute -right-6 -bottom-6 w-36 h-36 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </motion.div>
        </Link>
      </div>
    </div>
  );
};

const MoodCard = ({ icon, label, color, active = false }: any) => (
  <motion.div 
    whileTap={{ scale: 0.95 }}
    className={cn(
      "min-w-[88px] p-3 rounded-2xl flex flex-col items-center gap-2 shadow-md transition-all cursor-pointer border border-white/5",
      color
    )}
  >
    <div className={cn(label === "FELIZ" ? "text-emerald-950" : "text-white")}>
      {icon}
    </div>
    <span className={cn("text-[8px] font-black tracking-[0.15em] uppercase", label === "FELIZ" ? "text-emerald-950" : "text-white")}>
      {label}
    </span>
  </motion.div>
);

const FeatureCard = ({ icon, title, desc, color, href, colSpan, textColor = "text-white" }: any) => (
  <Link href={href} className={colSpan}>
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className={cn("p-5 rounded-2xl shadow-xl border border-white/10 flex flex-col h-full group hover:scale-[1.02] transition-all relative overflow-hidden", color)}
    >
      <div className={cn("w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-10 transition-all group-hover:scale-110", textColor)}>
        {icon}
      </div>
      <div>
        <h3 className={cn("font-black leading-tight tracking-tight mb-1", textColor)}>{title}</h3>
        <p className={cn("text-[9px] font-mono uppercase tracking-widest opacity-80", textColor)}>{desc}</p>
      </div>
    </motion.div>
  </Link>
);
