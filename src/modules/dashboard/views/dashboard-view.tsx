"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Sparkles, Heart, Moon, Sun, BarChart3, MessageCircle, 
  BookOpen, Wind, Stethoscope, User, Smile, Frown, AlertCircle,
  Activity, Bell, Settings, ChevronRight, Loader2, Zap, Shield, MessageSquare
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
import { getUnreadMessagesCount } from "@/app/actions/chat-actions";
import { InstallPWA } from "@/components/install-pwa";

export const DashboardView = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("...");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("usuario");
  const [fullStats, setFullStats] = useState<any>(null);
  const [selectedMood, setSelectedMood] = useState<"feliz" | "triste" | "ansioso">("feliz");
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const profile = await getMyProfile();
      if (!profile) {
        router.push("/auth/login");
        return;
      }

      setUserName(profile.fullName || "Usuario");
      setAvatarUrl(profile.avatarUrl || "");
      setRole(profile.role || "usuario");

      const dashboardStats = await getDashboardStats();
      if (dashboardStats) {
        setFullStats(dashboardStats);
      }
      
      const count = await getUnreadMessagesCount();
      setUnreadCount(count);

      setIsLoading(false);
    };
    
    loadData();

    // Suscribirse a notificaciones en tiempo real
    const channel = supabase
      .channel('notifications:global')
      .on('broadcast', { event: 'new-notification' }, async () => {
        const count = await getUnreadMessagesCount();
        setUnreadCount(count);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  if (isLoading || !fullStats) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-[#B7B1F2] animate-spin" />
      </div>
    );
  }

  const moodColors: Record<string, string> = {
    feliz: "#A7E6D7",
    triste: "#B7B1F2",
    ansioso: "#FFC3A0"
  };

  const chartColor = moodColors[selectedMood];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8F9FE] dark:bg-slate-950 text-zinc-400 font-sans p-5 w-full overflow-x-hidden overflow-y-auto scroll-smooth no-scrollbar">
      <header className="flex justify-between items-start mb-8 pt-6 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#A7E6D7] animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">SISTEMA_ACTIVO v4.0</span>
          </div>
          <h1 className="text-3xl font-black text-zinc-800 dark:text-white tracking-tight">Hola, {userName}</h1>
        </div>
        <div className="flex gap-2 items-center">
          {role === "admin" && (
            <Link href="/admin">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm active:scale-90 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
            </Link>
          )}
          <Link href="/chat/inbox">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 flex items-center justify-center text-[#B7B1F2] shadow-sm active:scale-90 transition-transform relative">
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse" />
              )}
            </div>
          </Link>
          <InstallPWA />
          <Link href="/profile">
            <div className="w-10 h-10 rounded-xl bg-[#B7B1F2] border border-white dark:border-white/10 overflow-hidden flex items-center justify-center text-white font-black shadow-lg shadow-[#B7B1F2]/20 transition-transform active:scale-95">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName[0]?.toUpperCase()
              )}
            </div>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 flex justify-center gap-3 overflow-x-auto no-scrollbar pb-2">
          <MoodCard 
            icon={<Smile className="w-5 h-5" />} 
            label="FELIZ" 
            color="bg-[#A7E6D7]" 
            active={selectedMood === "feliz"} 
            onClick={() => setSelectedMood("feliz")}
          />
          <MoodCard 
            icon={<Frown className="w-5 h-5" />} 
            label="TRISTE" 
            color="bg-[#B7B1F2]" 
            active={selectedMood === "triste"} 
            onClick={() => setSelectedMood("triste")}
          />
          <MoodCard 
            icon={<AlertCircle className="w-5 h-5" />} 
            label="ANSIOSO" 
            color="bg-[#FFC3A0]" 
            active={selectedMood === "ansioso"} 
            onClick={() => setSelectedMood("ansioso")}
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          key={selectedMood}
          className="col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-50 dark:border-white/5"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">ANÁLISIS_EMOCIONAL</p>
              <h2 className="text-lg font-black text-zinc-800 dark:text-white tracking-tight capitalize">Frecuencia: {selectedMood}</h2>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${chartColor}20` }}>
              <Activity className="w-4 h-4" style={{ color: chartColor }} />
            </div>
          </div>
          
          <div className="h-40 w-full min-h-[160px] relative">
            <ResponsiveContainer width="100%" height="100%" minHeight={160}>
              <AreaChart data={fullStats.moodData[selectedMood]}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
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
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg shadow-2xl border border-zinc-100 dark:border-white/5">
                          <p className="text-[10px] font-mono font-black" style={{ color: chartColor }}>{payload[0].value} registros</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={chartColor} 
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
            <p className="text-xl font-mono font-black text-zinc-800 dark:text-white">{fullStats.streak} Días</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-xl border border-zinc-50 dark:border-white/5 flex flex-col justify-between h-32">
          <div className="w-8 h-8 rounded-lg bg-[#B7B1F2]/10 text-[#B7B1F2] flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1">Diarios</p>
            <p className="text-xl font-mono font-black text-zinc-800 dark:text-white">{fullStats.totalEntries} Logs</p>
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

        <Link href="/diary" className="col-span-2">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-[#7BD3EA] rounded-2xl p-6 shadow-xl border border-white/10 flex items-center justify-between group hover:scale-[1.01] transition-all relative overflow-hidden"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-sky-950 flex items-center justify-center transition-all group-hover:scale-110">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-sky-950 tracking-tight">Diario Emocional</h3>
                <p className="text-[10px] font-mono text-sky-900/60 font-black uppercase tracking-widest">Registra tus pensamientos</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-sky-950/40 group-hover:text-sky-950 transition-colors relative z-10" />
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </motion.div>
        </Link>

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

const MoodCard = ({ icon, label, color, active = false, onClick }: any) => (
  <motion.div 
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={cn(
      "min-w-[88px] p-3 rounded-2xl flex flex-col items-center gap-2 shadow-md transition-all cursor-pointer border border-white/5",
      active ? color : "bg-white dark:bg-zinc-900 opacity-60 hover:opacity-100"
    )}
  >
    <div className={cn(active && label === "FELIZ" ? "text-emerald-950" : active ? "text-white" : "text-zinc-400")}>
      {icon}
    </div>
    <span className={cn("text-[8px] font-black tracking-[0.15em] uppercase", active && label === "FELIZ" ? "text-emerald-950" : active ? "text-white" : "text-zinc-400")}>
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
