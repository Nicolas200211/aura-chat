"use client";

import { useState } from "react";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../hooks/use-auth";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const LoginView = () => {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(formData);
    if (result.success) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen flex-col p-8 bg-gradient-to-br from-[#E7E6FF] via-[#E8F6FF] to-[#E8FFF6] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="mb-12">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-white/50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-zinc-600" />
        </button>
      </header>

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <div className="mb-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-white/10"
          >
            <img src="/image/logo/logo_mente_en_calma.png" alt="Aura Logo" className="w-full h-full object-cover" />
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-black text-zinc-800 dark:text-white tracking-tight uppercase"
          >
            Bienvenido
          </motion.h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mt-1">Ingresa a tu espacio_v4.0</p>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

          <div className="flex justify-end">
            <button type="button" className="text-sm text-[#928EFF] font-medium hover:underline">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <Button type="submit" className="h-14 mt-4" disabled={isLoading}>
            {isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        <div className="mt-auto mb-10 text-center">
          <p className="text-zinc-500">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/register" className="text-[#928EFF] font-bold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
