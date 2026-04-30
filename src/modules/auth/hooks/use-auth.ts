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
      if (!credentials.email || !credentials.password) {
        throw new Error("El correo y la contraseña son obligatorios");
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.name || credentials.email.split('@')[0],
          }
        }
      });

      if (authError) throw authError;

      return { success: true, message: "Registro exitoso. Revisa tu email si es necesario." };
    } catch (err: any) {
      const msg = err.message || "Error al registrar usuario";
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
