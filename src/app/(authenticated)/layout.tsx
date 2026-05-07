"use client";

import { BottomNav } from "@/components/ui/bottom-nav";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyProfile } from "@/app/actions/content-actions";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("usuario");
  
  useEffect(() => {
    const loadRole = async () => {
      const profile = await getMyProfile();
      if (profile?.role) {
        setRole(profile.role);
      }
    };
    loadRole();
  }, []);
  
  // Lista de rutas exactas donde SÍ se debe mostrar la navegación inferior
  const showNavRoutes = [
    "/dashboard", 
    "/exercises", 
    "/therapy", 
    "/diary", 
    "/profile", 
    "/chat/inbox", // La lista de mensajes sí muestra nav
    "/psychologist/patients"
  ];
  
  // Se muestra solo si la ruta actual es exactamente una de las principales
  const shouldShowNav = showNavRoutes.includes(pathname);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black items-center justify-center">
      {/* Mobile Shell: Confinement for desktop, full for mobile */}
      <div className="w-full max-w-md h-screen bg-[#F8F9FE] dark:bg-slate-950 flex flex-col relative overflow-hidden shadow-2xl lg:border-x lg:border-zinc-200 lg:dark:border-white/5">
        <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
          {children}
        </main>
        
        {shouldShowNav && <BottomNav role={role} />}
      </div>
    </div>
  );
}
