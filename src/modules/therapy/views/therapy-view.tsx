"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageCircle, Calendar, ShieldCheck, Search, X, CheckCircle2, Clock, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSpecialists, getAppointments, saveAppointment, deleteAppointment } from "@/app/actions/content-actions";

export const TherapyView = () => {
  const [specialistsList, setSpecialistsList] = useState<any[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"specialists" | "appointments">("specialists");
  const [selectedSpecialist, setSelectedSpecialist] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(16);
  const [selectedTime, setSelectedTime] = useState("10:30 AM");

  const loadData = async () => {
    setIsLoading(true);
    const [specialistsData, appointmentsData] = await Promise.all([
      getSpecialists(),
      getAppointments()
    ]);
    setSpecialistsList(specialistsData);
    setAppointmentsList(appointmentsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBook = (specialist: any) => {
    setSelectedSpecialist(specialist);
    setIsBooking(true);
    setStep(1);
  };

  const confirmBooking = async () => {
    if (!selectedSpecialist) return;
    try {
      await saveAppointment(
        selectedSpecialist.id,
        `2024-05-${selectedDate}`,
        selectedTime
      );
      await loadData(); // Recargar la lista para que aparezca la nueva cita
      setStep(2);
    } catch (error) {
      alert("No se pudo realizar la reserva. Inténtalo de nuevo.");
    }
  };

  const handleCancelAppointment = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas cancelar esta cita?")) {
      try {
        await deleteAppointment(id);
        await loadData();
      } catch (error) {
        alert("No se pudo cancelar la cita.");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FE] dark:bg-slate-950 text-zinc-400 font-sans p-4 pb-24 selection:bg-[#B7B1F2]/30">
      <header className="mb-6 pt-4 flex justify-between items-end px-2">
        <div>
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-white tracking-tight">Terapia</h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mt-1">SISTEMA_EMOCIONAL v1.0</p>
        </div>
      </header>

      {/* Tabs System - Bento Style */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-white/5 mb-8 shadow-sm">
        <button
          onClick={() => setActiveTab("specialists")}
          className={cn(
            "py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl",
            activeTab === "specialists"
              ? "bg-[#B7B1F2] text-white shadow-lg shadow-[#B7B1F2]/20"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          Explorar
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          className={cn(
            "py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl",
            activeTab === "appointments"
              ? "bg-[#B7B1F2] text-white shadow-lg shadow-[#B7B1F2]/20"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          Mis Citas
        </button>
      </div>

      {activeTab === "specialists" ? (
        <div className="flex flex-col gap-4">
          {/* Search Box Card */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-2xl transition-all hover:border-[#B7B1F2]/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="BUSCAR_ESPECIALISTA_DB..."
                className="w-full bg-[#F8F9FE] dark:bg-slate-950 border border-zinc-100 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-[11px] font-mono text-[#B7B1F2] focus:outline-none focus:border-[#B7B1F2]/50 placeholder:text-zinc-500"
              />
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-[#A7E6D7]/5 p-4 rounded-2xl border border-[#A7E6D7]/10 flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-[#A7E6D7]/10 flex items-center justify-center text-[#A7E6D7] border border-[#A7E6D7]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-[#A7E6D7] font-bold uppercase tracking-wider">Sesión Encriptada</p>
              <p className="text-[10px] text-[#A7E6D7]/60 font-mono mt-0.5">Protocolo de seguridad extremo activo.</p>
            </div>
          </div>

          {/* Specialist Grid - Bento Mobile */}
          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-[#B7B1F2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Sincronizando_Especialistas...</p>
              </div>
            ) : specialistsList.map((specialist, i) => (
              <motion.div
                key={specialist.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-2xl transition-all duration-300 hover:border-[#B7B1F2]/20 active:scale-[0.98]",
                  i === 0 && "border-[#B7B1F2]/10"
                )}
              >
                <div className="flex gap-4">
                  <div className="relative">
                    {specialist.image ? (
                      <img
                        src={specialist.image}
                        alt={specialist.name}
                        className="w-16 h-16 rounded-xl object-cover border border-zinc-100 dark:border-white/10"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[#F8F9FE] dark:bg-slate-950 border border-zinc-100 dark:border-white/10 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-inner">
                        {specialist.name[0]}
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#A7E6D7] rounded-full border-2 border-white dark:border-zinc-900" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-zinc-800 dark:text-white text-sm">{specialist.name}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">ID: SPEC-{specialist.id}</p>
                      </div>
                      <div className="bg-amber-500/10 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-mono font-bold text-amber-500">{specialist.rating}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium">{specialist.specialty}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Experiencia</span>
                    <span className="text-sm font-mono font-bold text-[#A7E6D7]">{specialist.experience}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBook(specialist)}
                      className="bg-[#B7B1F2] text-white px-5 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#B7B1F2]/90 transition-all shadow-lg shadow-[#B7B1F2]/20"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {appointmentsList.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#F8F9FE] dark:bg-slate-950 border border-zinc-100 dark:border-white/5 rounded-xl flex items-center justify-center text-[#B7B1F2] font-bold">
                    {app.specialistImage ? (
                      <img src={app.specialistImage} alt={app.specialistName} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      app.specialistName[0]
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-white">{app.specialistName}</h3>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1">CITA-{app.id}</p>
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest",
                  app.status === "Confirmado"
                    ? "bg-[#A7E6D7]/10 text-[#A7E6D7]"
                    : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                )}>
                  {app.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 bg-[#F8F9FE] dark:bg-slate-950/50 border-y border-zinc-100 dark:border-white/5 rounded-xl px-4 mb-6">
                <div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Fecha_Cita</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#B7B1F2]" />
                    <span className="text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-300">{app.date}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Horario</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#B7B1F2]" />
                    <span className="text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-300">{app.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-[#F8F9FE] dark:bg-slate-950 border border-zinc-100 dark:border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest rounded-xl hover:text-white transition-all">
                  Reprogramar
                </button>
                <button
                  onClick={() => handleCancelAppointment(app.id)}
                  className="px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          ))}
          {appointmentsList.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-2xl">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em]">SIN_REGISTROS</p>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal Adapted for Mobile Bento Tech */}
      <AnimatePresence>
        {isBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative border border-zinc-100 dark:border-white/10"
            >
              <button
                onClick={() => setIsBooking(false)}
                className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-white transition-all bg-[#F8F9FE] dark:bg-slate-950 border border-zinc-100 dark:border-white/5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>

              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 bg-[#F8F9FE] dark:bg-slate-950 border border-zinc-100 dark:border-white/10 rounded-xl overflow-hidden flex items-center justify-center text-xl font-bold text-[#B7B1F2]">
                      {selectedSpecialist?.image ? (
                        <img src={selectedSpecialist.image} alt={selectedSpecialist.name} className="w-full h-full object-cover" />
                      ) : (
                        selectedSpecialist?.name[0]
                      )}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-zinc-800 dark:text-white">{selectedSpecialist?.name}</h2>
                      <p className="text-[10px] font-mono text-[#B7B1F2] uppercase tracking-widest mt-1">{selectedSpecialist?.id}</p>
                    </div>
                  </div>

                  <div className="h-px bg-zinc-100 dark:bg-white/5 w-full" />

                  <div>
                    <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4">Seleccionar_Fecha</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 16, 17, 18, 19, 20].map((day, i) => (
                        <button
                          key={day}
                          onClick={() => setSelectedDate(day)}
                          className={cn(
                            "flex flex-col items-center justify-center py-4 border rounded-xl transition-all",
                            selectedDate === day
                              ? "bg-[#B7B1F2] text-white border-transparent shadow-2xl scale-[1.02]"
                              : "bg-[#F8F9FE] dark:bg-slate-950 text-zinc-500 border-zinc-100 dark:border-white/5 hover:border-[#B7B1F2]/20"
                          )}
                        >
                          <span className="text-[8px] font-bold uppercase mb-1 tracking-widest">{['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][i]}</span>
                          <span className="text-sm font-mono font-bold">{day}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4">Seleccionar_Hora</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM", "06:00 PM", "07:30 PM"].map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "py-3 text-[10px] font-mono font-bold transition-all border rounded-xl",
                            selectedTime === time
                              ? "bg-[#A7E6D7] text-emerald-900 border-transparent shadow-lg scale-[1.02]"
                              : "bg-[#F8F9FE] dark:bg-slate-950 text-zinc-500 border-zinc-100 dark:border-white/5 hover:border-[#B7B1F2]/20"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={confirmBooking}
                    className="w-full bg-[#B7B1F2] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-2xl active:scale-[0.98] transition-all mt-4"
                  >
                    Confirmar_Reserva
                  </button>
                </div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-20 h-20 bg-[#A7E6D7]/10 text-[#A7E6D7] flex items-center justify-center mb-8 rounded-2xl border border-[#A7E6D7]/20 shadow-2xl">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-800 dark:text-white mb-2 uppercase tracking-widest">Reserva_Exitosa</h2>
                  <p className="text-zinc-500 text-[11px] font-mono max-w-[200px] mb-8 leading-relaxed uppercase">
                    La sesión con {selectedSpecialist?.name} ha sido registrada correctamente.
                  </p>
                  <button
                    onClick={() => setIsBooking(false)}
                    className="w-full bg-[#B7B1F2] text-white py-4 font-bold rounded-xl tracking-widest text-[11px] uppercase shadow-2xl"
                  >
                    Cerrar_Sesión
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
