"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Shield, User, Loader2, ArrowLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Simulation of server actions for Admin
import { getAllSpecialists, updateSpecialistStatus } from "../../../app/actions/admin-actions";

export const AdminDashboardView = () => {
  const router = useRouter();
  const [specialistsData, setSpecialistsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getAllSpecialists();
    setSpecialistsData(data);
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
    <div className="flex flex-col p-6 bg-[#F8F9FE] dark:bg-slate-950 min-h-full">
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

      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => { setActiveTab('pending'); setExpandedId(null); }}
          className={`flex-1 py-3 rounded-2xl text-[10px] font-mono font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-[#928EFF] text-white shadow-lg shadow-[#928EFF]/20' : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-100 dark:border-white/5'}`}
        >
          Pendientes ({specialistsData.filter(s => s.verificationStatus === 'pending').length})
        </button>
        <button 
          onClick={() => { setActiveTab('all'); setExpandedId(null); }}
          className={`flex-1 py-3 rounded-2xl text-[10px] font-mono font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-zinc-800 text-white shadow-lg' : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-100 dark:border-white/5'}`}
        >
          Todos ({specialistsData.length})
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
            <Shield className="w-4 h-4 text-[#928EFF]" />
            <h2 className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">
              {activeTab === 'pending' ? 'Solicitudes Pendientes' : 'Lista Completa'}
            </h2>
        </div>

        <AnimatePresence>
          {(activeTab === 'pending' ? specialistsData.filter(s => s.verificationStatus === 'pending') : specialistsData).length > 0 ? (
            (activeTab === 'pending' ? specialistsData.filter(s => s.verificationStatus === 'pending') : specialistsData).map((spec) => (
              <motion.div 
                key={spec.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setExpandedId(expandedId === spec.id ? null : spec.id)}
                className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-white/5 shadow-sm cursor-pointer transition-all hover:border-[#928EFF]/30"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      {spec.image ? (
                        <img src={spec.image} alt={spec.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-zinc-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-800 dark:text-white leading-none">{spec.name}</h3>
                      <p className="text-[#928EFF] text-xs font-bold mt-1">{spec.specialty}</p>
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[9px] font-mono text-zinc-500 border border-zinc-200 dark:border-white/5">
                        LIC: {spec.licenseNumber || "NO_DATA"}
                      </div>
                    </div>
                  </div>
                  {!expandedId || expandedId !== spec.id ? (
                    <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                       <ChevronRight className="w-4 h-4" />
                    </div>
                  ) : null}
                </div>

                <AnimatePresence>
                  {expandedId === spec.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-white/5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Nombre Completo</p>
                            <p className="text-xs font-bold text-zinc-800 dark:text-white">{spec.name}</p> 
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Especialidad</p>
                            <p className="text-xs font-bold text-zinc-800 dark:text-white">{spec.specialty}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">Colegiatura</p>
                            <p className="text-xs font-bold text-zinc-800 dark:text-white">{spec.licenseNumber || "No adjunta"}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1">ID Sistema</p>
                            <p className="text-[10px] font-mono text-zinc-500 truncate" title={spec.userId}>{spec.userId}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                          {spec.verificationStatus === 'pending' && (
                            <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleReject(spec.id); }}
                                className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-500/20 active:scale-95 transition-all"
                              >
                                <XCircle className="w-4 h-4" /> Rechazar
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleApprove(spec.id); }}
                                className="flex-1 py-3 rounded-xl bg-[#928EFF] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#807ce6] shadow-lg shadow-[#928EFF]/20 active:scale-95 transition-all"
                              >
                                <CheckCircle className="w-4 h-4" /> Aprobar
                              </button>
                            </>
                          )}

                          {spec.verificationStatus === 'approved' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleReject(spec.id); }}
                              className="w-full py-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-amber-500/20 active:scale-95 transition-all"
                            >
                              <XCircle className="w-4 h-4" /> Deshabilitar
                            </button>
                          )}

                          {spec.verificationStatus === 'rejected' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleApprove(spec.id); }}
                              className="w-full py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#928EFF] hover:text-white hover:shadow-lg transition-all"
                            >
                              <CheckCircle className="w-4 h-4" /> Rehabilitar Acceso
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center">
                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest italic">Todo en orden. No hay solicitudes.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
      <div className="h-40 w-full shrink-0" aria-hidden="true" />
    </div>
  );
};
