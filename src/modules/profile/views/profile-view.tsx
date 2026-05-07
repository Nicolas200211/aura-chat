"use client";

import { useState, useEffect } from "react";
import { User, Settings, Shield, LogOut, ChevronRight, Award, Zap, Camera, ShieldCheck, Star, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

import { getMyProfile, updateProfile, getProfileStats, getSpecialistStats, getSpecialistProfile, updateSpecialistProfile } from "@/app/actions/content-actions";
import { logout } from "@/app/actions/auth-actions";

export const ProfileView = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("Cargando...");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("usuario");
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ badges: 0, streak: 0, sessions: 0, rating: "5.0" });
  const [specData, setSpecData] = useState({ specialty: "", licenseNumber: "", price: "", status: "" });

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "");
      const profile = await getMyProfile();
      if (profile) {
        setUserName(profile.fullName || "");
        setAvatarUrl(profile.avatarUrl || "");
        setRole(profile.role || "usuario");
        setNewName(profile.fullName || "");
        setNewAvatar(profile.avatarUrl || "");

        // Cargar estadísticas reales
        const profileStats = await getProfileStats();
        if (profile.role === "psicologo") {
          const [specStats, specialistInfo] = await Promise.all([
            getSpecialistStats(),
            getSpecialistProfile()
          ]);
          setStats({ ...profileStats, ...specStats });
          if (specialistInfo) {
            setSpecData({
              specialty: specialistInfo.specialty || "",
              licenseNumber: specialistInfo.licenseNumber || "",
              price: specialistInfo.price || "",
              status: specialistInfo.verificationStatus || "pending"
            });
          }
        } else {
          setStats({ ...stats, ...profileStats });
        }
      } else {
        const fallbackName = user.email?.split("@")[0] || "Usuario Aura";
        setUserName(fallbackName);
        setNewName(fallbackName);
      }
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ fullName: newName, avatarUrl: newAvatar });
      if (role === "psicologo") {
        await updateSpecialistProfile({ 
          specialty: specData.specialty, 
          licenseNumber: specData.licenseNumber, 
          price: specData.price 
        });
      }
      await loadProfile();
      setIsEditing(false);
    } catch (error) {
      alert("Error al guardar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex flex-col text-zinc-400 font-sans p-6 selection:bg-[#B7B1F2]/30">
      <header className="mb-10 pt-8 flex flex-col items-center">
        <div className="relative group cursor-pointer" onClick={() => setIsEditing(true)}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-28 h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-4 border-white dark:border-[#B7B1F2]/20 overflow-hidden flex items-center justify-center text-4xl text-[#B7B1F2] font-black shadow-2xl relative z-10"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              userName[0]?.toUpperCase()
            )}
          </motion.div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#B7B1F2] rounded-2xl border-4 border-white dark:border-slate-950 flex items-center justify-center shadow-lg z-20">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-black text-zinc-800 dark:text-white tracking-tight">{userName}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 justify-center">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-200 dark:border-white/5">{userEmail}</span>
            {role === "psicologo" && (
              <div className="flex gap-2">
                <span className="text-[10px] font-mono text-[#928EFF] font-bold uppercase tracking-[0.2em] bg-[#928EFF]/10 px-3 py-1 rounded-full border border-[#928EFF]/20 shadow-sm shadow-[#928EFF]/5">PSICÓLOGO</span>
                <span className={cn(
                  "text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border",
                  specData.status === 'approved' ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                )}>
                  {specData.status === 'approved' ? "VERIFICADO" : "PENDIENTE"}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl border border-zinc-100 dark:border-white/5 text-center flex flex-col items-center justify-center transition-all duration-300 hover:border-[#B7B1F2]/20"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-3">
            <Award className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Insignias</p>
          <p className="text-2xl font-mono font-black text-zinc-800 dark:text-white">{stats.badges.toString().padStart(2, '0')}</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl border border-zinc-100 dark:border-white/5 text-center flex flex-col items-center justify-center transition-all duration-300 hover:border-[#A7E6D7]/20"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
            <Zap className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Racha</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-mono font-black text-zinc-800 dark:text-white">{stats.streak}</p>
            <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase">Días</span>
          </div>
        </motion.div>

        {/* MÉTRIAS PROFESIONALES (Solo Psicólogo) */}
        {role === "psicologo" && (
          <>
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl border border-zinc-100 dark:border-white/5 text-center flex flex-col items-center justify-center transition-all duration-300 hover:border-[#928EFF]/20"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#928EFF]/10 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 text-[#928EFF]" />
              </div>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Sesiones</p>
              <p className="text-2xl font-mono font-black text-zinc-800 dark:text-white">{stats.sessions.toString().padStart(2, '0')}</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl border border-zinc-100 dark:border-white/5 text-center flex flex-col items-center justify-center transition-all duration-300 hover:border-amber-400/20"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 flex items-center justify-center mb-3">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Rating</p>
              <p className="text-2xl font-mono font-black text-zinc-800 dark:text-white">{stats.rating}</p>
            </motion.div>
          </>
        )}
      </div>

      {/* Security Banner Bento */}
      <div className="bg-[#B7B1F2]/5 p-4 rounded-2xl border border-[#B7B1F2]/10 flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#B7B1F2]/10 flex items-center justify-center text-[#B7B1F2] border border-[#B7B1F2]/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] text-[#B7B1F2] font-bold uppercase tracking-wider">Perfil Protegido</p>
          <p className="text-[9px] text-[#B7B1F2]/60 font-mono mt-0.5 uppercase tracking-tighter">PROTOCOL_V3_ACTIVE</p>
        </div>
      </div>

      {/* Settings Menu Bento List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-white/5 overflow-hidden mb-8">
        <div onClick={() => setIsEditing(true)}>
          <ProfileItem icon={<User className="w-5 h-5 text-blue-400" />} label="Datos Personales" metric="EDIT_INFO" />
        </div>
        <ProfileItem icon={<Shield className="w-5 h-5 text-emerald-400" />} label="Seguridad" metric="ENCRYPT" />
        <ProfileItem icon={<Settings className="w-5 h-5 text-zinc-400" />} label="Configuración" metric="CORE_V1" />
      </div>

      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        className="w-full bg-rose-500/10 dark:bg-rose-500/5 text-rose-500 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-rose-500/20 transition-all border border-rose-500/10 shadow-lg shadow-rose-500/5"
      >
        <LogOut className="w-5 h-5" />
        Cerrar Sesión
      </motion.button>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative border border-zinc-100 dark:border-white/10 my-8"
            >
              <h2 className="text-xl font-black text-zinc-800 dark:text-white mb-6 uppercase tracking-widest">Configurar Perfil</h2>
              
              <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-mono font-black text-[#B7B1F2] uppercase tracking-[0.2em] border-b border-[#B7B1F2]/10 pb-2">Datos Básicos</h3>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Nombre Completo</label>
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-[#F8F9FE] dark:bg-slate-950 border border-zinc-100 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-zinc-800 dark:text-white focus:border-[#B7B1F2]/50 focus:outline-none"
                      placeholder="Tu nombre..."
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">URL de Avatar</label>
                    <input 
                      type="text" 
                      value={newAvatar}
                      onChange={(e) => setNewAvatar(e.target.value)}
                      className="w-full bg-[#F8F9FE] dark:bg-slate-950 border border-zinc-100 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-zinc-800 dark:text-white focus:border-[#B7B1F2]/50 focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {role === "psicologo" && (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-[10px] font-mono font-black text-[#928EFF] uppercase tracking-[0.2em] border-b border-[#928EFF]/10 pb-2">Configuración Profesional</h3>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Especialidad</label>
                      <input 
                        type="text" 
                        value={specData.specialty}
                        onChange={(e) => setSpecData({ ...specData, specialty: e.target.value })}
                        className="w-full bg-[#F8F9FE] dark:bg-slate-950 border border-zinc-100 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-zinc-800 dark:text-white focus:border-[#928EFF]/50 focus:outline-none"
                        placeholder="Ej: Ansiedad y Depresión"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Precio por Sesión</label>
                      <input 
                        type="text" 
                        value={specData.price}
                        onChange={(e) => setSpecData({ ...specData, price: e.target.value })}
                        className="w-full bg-[#F8F9FE] dark:bg-slate-950 border border-zinc-100 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-zinc-800 dark:text-white focus:border-[#928EFF]/50 focus:outline-none"
                        placeholder="Ej: S/ 50"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Número de Licencia</label>
                      <input 
                        type="text" 
                        value={specData.licenseNumber}
                        onChange={(e) => setSpecData({ ...specData, licenseNumber: e.target.value })}
                        className="w-full bg-[#F8F9FE] dark:bg-slate-950 border border-zinc-100 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-zinc-800 dark:text-white focus:border-[#928EFF]/50 focus:outline-none"
                        placeholder="CP-123456"
                      />
                      <p className="text-[8px] text-zinc-400 italic mt-1">* Si cambias tu licencia, volverás a estado 'Pendiente'.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-8">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-widest rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-[#B7B1F2] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-[#B7B1F2]/20"
                >
                  {isSaving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileItem = ({ icon, label, metric }: { icon: React.ReactNode; label: string; metric: string }) => (
  <button className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all border-b border-zinc-50 dark:border-white/5 last:border-0 group">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-zinc-50 dark:bg-slate-950 rounded-xl border border-zinc-100 dark:border-white/5 group-hover:border-[#B7B1F2]/30 transition-all">
        {icon}
      </div>
      <div className="text-left">
        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block">{label}</span>
        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mt-0.5">{metric}</span>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-[#B7B1F2] group-hover:translate-x-1 transition-all" />
  </button>
);
