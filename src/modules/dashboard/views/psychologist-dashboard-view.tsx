"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, Calendar, Clock, CreditCard, TrendingUp, 
  MessageSquare, Bell, Settings, ChevronRight, Loader2, 
  UserCheck, History, PlusCircle, Star, Award, Briefcase,
  Search, Filter, MoreHorizontal
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
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import { getMyProfile, getSpecialistProfile, getSpecialistAppointments } from "@/app/actions/content-actions";
import { getSpecialistConversation } from "@/app/actions/chat-actions";
import { InstallPWA } from "@/components/install-pwa";

export const PsychologistDashboardView = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("...");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [specialistInfo, setSpecialistInfo] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Datos mock para visualización si no hay reales
  const activityData = [
    { day: "LUN", sessions: 4 },
    { day: "MAR", sessions: 6 },
    { day: "MIÉ", sessions: 5 },
    { day: "JUE", sessions: 8 },
    { day: "VIE", sessions: 7 },
    { day: "SÁB", sessions: 3 },
    { day: "DOM", sessions: 2 },
  ];

  const ratingStats = [
    { name: "5★", count: 85, fill: "#928EFF" },
    { name: "4★", count: 12, fill: "#B7B1F2" },
    { name: "3★", count: 3, fill: "#E7E6FF" },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }

        const [profile, specialist, appointmentsData] = await Promise.all([
          getMyProfile(),
          getSpecialistProfile(),
          getSpecialistAppointments()
        ]);

        if (profile) {
          setUserName(profile.fullName || user.email?.split('@')[0] || "Especialista");
          setAvatarUrl(profile.avatarUrl || "");
        }
        
        if (specialist) {
          setSpecialistInfo(specialist);
        }

        setAppointments(appointmentsData.slice(0, 3)); 
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [router]);

  const handleChat = async (patientId: string, specialistId: number) => {
    if (!specialistId) return;
    setIsRedirecting(true);
    try {
      const conv = await getSpecialistConversation(patientId, specialistId);
      router.push(`/chat/specialist/${conv.id}`);
    } catch (error) {
      console.error("Error al iniciar chat:", error);
    } finally {
      setIsRedirecting(false);
    }
  };

  if (isLoading || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-[#928EFF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-5 font-sans selection:bg-[#928EFF]/30">
      <header className="flex justify-between items-start mb-6 pt-6 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#928EFF] animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">SISTEMA_GESTIÓN_PRO v4.2</span>
          </div>
          <h1 className="text-3xl font-black text-zinc-800 dark:text-white tracking-tight leading-none italic">Aura Pro</h1>
          <p className="text-zinc-500 text-[11px] font-medium mt-1 uppercase tracking-wider">Terminal del Especialista</p>
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/chat/inbox">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 flex items-center justify-center text-[#928EFF] shadow-sm active:scale-90 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
          </Link>
          <Link href="/profile">
            <div className="w-10 h-10 rounded-xl bg-[#928EFF] border-2 border-white dark:border-white/10 overflow-hidden flex items-center justify-center text-white font-black shadow-lg shadow-[#928EFF]/20 transition-transform active:scale-95">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName[0]?.toUpperCase()
              )}
            </div>
          </Link>
        </div>
      </header>

      {/* Professional Profile Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-xl border border-zinc-50 dark:border-white/5"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-white/10">
            {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <Briefcase className="w-6 h-6 text-zinc-400" />
              )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-zinc-800 dark:text-white leading-tight">{userName}</h2>
            <p className="text-[#928EFF] text-xs font-bold">{specialistInfo?.specialty || "Especialista en Salud Mental"}</p>
            <div className="flex items-center gap-2 mt-1">
               <Award className="w-3 h-3 text-amber-500" />
               <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">{specialistInfo?.experience || "5+ años de exp."}</span>
            </div>
          </div>
          <div className="bg-[#928EFF]/10 px-3 py-1.5 rounded-xl border border-[#928EFF]/20">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#928EFF] fill-[#928EFF]" />
              <span className="text-xs font-black text-[#928EFF]">{specialistInfo?.rating || "5.0"}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-50 dark:border-white/5">
          <div className="text-center">
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-tighter">Pacientes</p>
            <p className="text-sm font-black text-zinc-800 dark:text-white">42</p>
          </div>
          <div className="text-center border-x border-zinc-50 dark:border-white/5">
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-tighter">Sesiones</p>
            <p className="text-sm font-black text-zinc-800 dark:text-white">128</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-tighter">Estado</p>
            <p className="text-[10px] font-bold text-emerald-500 uppercase">Activo</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {/* Rating Breakdown */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-50 dark:border-white/5"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
               <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">ANALÍTICA_CALIFICACIONES</p>
               <h2 className="text-xl font-black text-zinc-800 dark:text-white tracking-tight">Feedback de Pacientes</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-zinc-800 dark:text-white leading-none">{specialistInfo?.rating || "4.9"}</span>
              <div className="flex gap-0.5 mt-2">
                {[1,2,3,4,5].map(i => <Star key={i} className={cn("w-3 h-3", i <= 5 ? "text-amber-500 fill-amber-500" : "text-zinc-200")} />)}
              </div>
              <p className="text-[9px] font-mono text-zinc-400 mt-2">124 RESEÑAS</p>
            </div>
            
            <div className="flex-1 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingStats} layout="vertical">
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                   <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Sessions Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-50 dark:border-white/5"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
               <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">MÉTRICAS_DE_FLUJO</p>
               <h2 className="text-xl font-black text-zinc-800 dark:text-white tracking-tight">Sesiones Semanales</h2>
            </div>
            <div className="bg-[#928EFF]/10 p-2 rounded-xl flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#928EFF]" />
            </div>
          </div>
          
          <div className="h-40 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorPsychPro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#928EFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#928EFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.05} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }}
                />
                <YAxis hide />
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#928EFF" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorPsychPro)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pro Tools Grid */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
           <Link href="/psychologist/patients" className="contents">
             <ToolCard 
              icon={<UserCheck className="w-5 h-5" />} 
              title="Pacientes" 
              metric="42 Activos"
              color="bg-[#928EFF]" 
            />
           </Link>
          <ToolCard 
            icon={<CreditCard className="w-5 h-5" />} 
            title="Ingresos" 
            metric="$2.4k Mes"
            color="bg-zinc-800" 
          />
        </div>

        {/* Schedule Preview */}
        <div className="col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-50 dark:border-white/5">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-black text-zinc-800 dark:text-white tracking-tight italic">Próximas Citas</h3>
             <Calendar className="w-5 h-5 text-[#928EFF]" />
          </div>
          <div className="space-y-3">
            {appointments.length > 0 ? (
              appointments.map((cita, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/5 group hover:border-[#928EFF]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#928EFF]/10 text-[#928EFF] flex items-center justify-center font-bold text-xs overflow-hidden">
                      {cita.patientImage ? (
                        <img src={cita.patientImage} alt={cita.patientName} className="w-full h-full object-cover" />
                      ) : (
                        cita.patientName?.split(' ').map((n: string) => n[0]).join('')
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-800 dark:text-white">{cita.patientName}</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-tighter">SESIÓN_VIRTUAL</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleChat(cita.patientId, specialistInfo?.id)}
                      className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 flex items-center justify-center text-[#928EFF] shadow-sm hover:bg-[#928EFF] hover:text-white transition-all active:scale-90"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#928EFF]">{cita.time}</p>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{cita.status}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-2xl">
                <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Sin citas pendientes</p>
              </div>
            )}
          </div>
          <Link href="/therapy">
            <button className="w-full mt-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-[#928EFF] transition-colors border-t border-zinc-50 dark:border-white/5 pt-4">
              Gestionar Agenda Completa
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const ToolCard = ({ icon, title, metric, color }: any) => (
  <motion.div 
    whileTap={{ scale: 0.98 }}
    className={cn("p-5 rounded-3xl shadow-xl border border-white/10 flex flex-col group relative overflow-hidden", color)}
  >
    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mb-8 transition-all group-hover:scale-110 text-white">
      {icon}
    </div>
    <div>
      <h3 className="font-black text-white leading-tight tracking-tight text-sm">{title}</h3>
      <p className="text-[10px] font-mono text-white/70 uppercase tracking-widest mt-1">{metric}</p>
    </div>
    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
  </motion.div>
);
