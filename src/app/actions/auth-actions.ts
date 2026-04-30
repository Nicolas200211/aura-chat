"use server";

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createClient();
  
  // Cerramos sesión en Supabase
  await supabase.auth.signOut();
  
  // Redirigimos al login limpiando el estado del cliente
  redirect("/auth/login");
}
