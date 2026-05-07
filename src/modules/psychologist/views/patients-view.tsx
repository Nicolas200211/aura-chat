"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, MoreHorizontal, User, 
  Calendar, MessageSquare, ChevronRight, 
  TrendingUp, TrendingDown, Minus, Loader2,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getPsychologistPatients } from "@/app/actions/content-actions";
import { getSpecialistConversation } from "@/app/actions/chat-actions";

export const PatientsView = () => {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadPatients = async () => {
      const data = await getPsychologistPatients();
      setPatients(data);
      setIsLoading(false);
    };
    loadPatients();
  }, []);

  const handleChat = async (patientId: string, specialistId: number) => {
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

  const filteredPatients = patients.filter(p => 
    p.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-[#928EFF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-5 font-sans">
      <header className="flex items-center gap-4 mb-8 pt-6">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 flex items-center justify-center text-zinc-500 shadow-sm transition-transform active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-zinc-800 dark:text-white tracking-tight">Mis Pacientes</h1>
          <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-widest">Base de Datos de Gestión</p>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#928EFF] p-5 rounded-3xl shadow-xl shadow-[#928EFF]/20 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-white/70 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Total Activos</p>
            <h3 className="text-3xl font-black text-white">{patients.length}</h3>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-white/5 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-zinc-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Nuevos (Mes)</p>
            <h3 className="text-3xl font-black text-zinc-800 dark:text-white">12</h3>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-zinc-400" />
        </div>
        <input 
          type="text"
          placeholder="Buscar paciente por nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#928EFF]/20 transition-all text-zinc-800 dark:text-white"
        />
        <button className="absolute inset-y-2 right-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 transition-colors hover:bg-[#928EFF] hover:text-white">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Patients List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient, i) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-100 dark:border-white/10 flex items-center justify-center">
                    {patient.avatarUrl ? (
                      <img src={patient.avatarUrl} alt={patient.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-zinc-800 dark:text-white leading-tight">{patient.fullName || "Sin nombre"}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">Última: {patient.lastSession || "Pendiente"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChat(patient.id, patient.specialistId);
                      }}
                      className="w-10 h-10 rounded-xl bg-[#928EFF]/10 text-[#928EFF] flex items-center justify-center transition-all hover:bg-[#928EFF] hover:text-white active:scale-90"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col items-end gap-1">
                      <div className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                        {patient.status || "Activo"}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-zinc-300" />
              </div>
              <p className="text-zinc-500 text-sm font-medium">No se encontraron pacientes</p>
              <p className="text-zinc-400 text-xs mt-1">Intenta con otro término de búsqueda</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <button className="w-full mt-8 py-4 bg-zinc-800 dark:bg-zinc-900 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-[#928EFF] transition-all shadow-lg shadow-black/5">
        Añadir Nuevo Registro
      </button>
    </div>
  );
};
