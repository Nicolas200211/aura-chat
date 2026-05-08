"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserCredentials, AuthResponse } from "../interfaces/auth.interface";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: UserCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error("El correo y la contraseña son obligatorios");
      }

      // 1. Intentamos Login Personalizado (Respaldo Robusto)
      const { customLogin } = await import("@/app/actions/auth-actions");
      const res = await customLogin(credentials.email, credentials.password);

      if (res.success) {
        // Si el login personalizado funciona, redirigimos directamente
        window.location.href = "/dashboard";
        return { success: true, message: "Inicio de sesión exitoso" };
      }

      // 2. Si falla el personalizado, intentamos Supabase (Solo por si acaso)
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) throw authError;

      return { success: true, message: "Inicio de sesión exitoso" };
    } catch (err: any) {
      const msg = err.message || "Error al iniciar sesión";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: UserCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const { customRegister } = await import("@/app/actions/auth-actions");
      const res = await customRegister({
        name: credentials.name || credentials.email.split('@')[0],
        email: credentials.email || '',
        pass: credentials.password || '',
        role: credentials.role || 'usuario',
        licenseNumber: credentials.licenseNumber
      });
      if (!res.success) throw new Error(res.message);
      return { success: true, message: res.message };
    } catch (err: any) {
      const msg = err.message || "Error al registrarse";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return {
    login,
    register,
    logout,
    isLoading,
    error,
  };
}
