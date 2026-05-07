"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Shield, User, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Simulation of server actions for Admin
import { getPendingSpecialists, updateSpecialistStatus } from "../../../app/actions/admin-actions";

export const AdminDashboardView = () => {
  const router = useRouter();
  const [pending, setPending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getPendingSpecialists();
    setPending(data);
    setIsLoading(false);
  };

  const handleApprove = async (id: number) => {
    await updateSpecialistStatus(id, 'approved');
    loadData();
  };

  const handleReject = async (id: number) => {
    await updateSpecialistStatus(id, 'rejected');
    loadData();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-[#928EFF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 bg-[#F8F9FE] dark:bg-slate-950 min-h-screen">
      <header className="flex items-center gap-4 mb-10 pt-6">
         <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 flex items-center justify-center text-zinc-500 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-zinc-800 dark:text-white uppercase italic tracking-tight">Panel de Control</h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Verificación de Profesionales</p>
        </div>
      </header>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
            <Shield className="w-4 h-4 text-[#928EFF]" />
            <h2 className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">Solicitudes_Pendientes ({pending.length})</h2>
        </div>

        <AnimatePresence>
          {pending.length > 0 ? (
            pending.map((spec) => (
              <motion.div 
                key={spec.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-white/5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <User className="w-6 h-6 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-800 dark:text-white leading-none">{spec.name}</h3>
                      <p className="text-[#928EFF] text-xs font-bold mt-1">{spec.specialty}</p>
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[9px] font-mono text-zinc-500 border border-zinc-200 dark:border-white/5">
                        LIC: {spec.licenseNumber || "NO_DATA"}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleReject(spec.id)}
                      className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleApprove(spec.id)}
                      className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500/20 transition-all"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center">
                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest italic">Todo en orden. No hay solicitudes.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
