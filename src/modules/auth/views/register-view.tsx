"use client";

import { useState } from "react";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../hooks/use-auth";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const RegisterView = () => {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "usuario", licenseNumber: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      router.push("/auth/login");
    }
  };

  const roles = [
    { id: "usuario", title: "Miembro", desc: "Busco bienestar y paz mental" },
    { id: "psicologo", title: "Psicólogo", desc: "Quiero ayudar a otros" }
  ];

  return (
    <div className="flex min-h-screen flex-col p-8 bg-gradient-to-br from-[#E7E6FF] via-[#E8F6FF] to-[#E8FFF6] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-white/50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-zinc-600" />
        </button>
      </header>

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pb-10">
        <div className="mb-8 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4 w-20 h-20 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-white/10"
          >
            <img src="/image/logo/logo_mente_en_calma.png" alt="Aura Logo" className="w-full h-full object-cover" />
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-black text-zinc-800 dark:text-white tracking-tight uppercase"
          >
            Comienza tu viaje
          </motion.h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mt-1">Crea tu cuenta de acceso</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 mb-2">
            {roles.map((r) => (
              <div 
                key={r.id}
                onClick={() => setFormData({ ...formData, role: r.id })}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all cursor-pointer text-center flex flex-col gap-1",
                  formData.role === r.id 
                    ? "bg-white dark:bg-zinc-800 border-[#928EFF] shadow-xl shadow-[#928EFF]/10" 
                    : "bg-white/50 dark:bg-white/5 border-transparent hover:border-zinc-200 dark:hover:border-white/10"
                )}
              >
                <span className={cn(
                  "text-xs font-black uppercase tracking-widest",
                  formData.role === r.id ? "text-[#928EFF]" : "text-zinc-500"
                )}>
                  {r.title}
                </span>
                <span className="text-[9px] text-zinc-400 leading-tight">
                  {r.desc}
                </span>
              </div>
            ))}
          </div>

          <Input
            label="Nombre completo"
            placeholder="Juan Pérez"
            type="text"
            icon={<User className="w-5 h-5" />}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          {formData.role === "psicologo" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
            >
              <Input
                label="Número de Licencia Profesional"
                placeholder="CP-123456"
                type="text"
                icon={<Lock className="w-5 h-5" />}
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                required={formData.role === "psicologo"}
              />
            </motion.div>
          )}

          <Input
            label="Correo electrónico"
            placeholder="tu@email.com"
            type="email"
            icon={<Mail className="w-5 h-5" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <div className="relative">
            <Input
              label="Contraseña"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              icon={<Lock className="w-5 h-5" />}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 bottom-3.5 text-zinc-400 hover:text-[#928EFF] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button type="submit" className="h-14 mt-2" disabled={isLoading}>
            {isLoading ? "Creando Cuenta..." : "Registrarse Ahora"}
          </Button>
        </form>

        <div className="mt-auto mb-10 text-center">
          <p className="text-zinc-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-[#928EFF] font-bold hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
