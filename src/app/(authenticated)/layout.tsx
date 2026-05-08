"use client";

import { BottomNav } from "@/components/ui/bottom-nav";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyProfile, getAuthenticatedUser } from "@/app/actions/content-actions";
import { cn } from "@/lib/utils";
import { MobileShell } from "@/components/layout/mobile-shell";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("usuario");

  useEffect(() => {
    const loadRole = async () => {
      // 1. Intentamos obtener el rol directamente de la sesión (más rápido)
      const authUser = await getAuthenticatedUser();
      if (authUser?.role) {
        setRole(authUser.role);
      }
      
      // 2. Cargamos el perfil completo en segundo plano
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
    "/psychologist/patients",
    "/admin",
    "/admin/dashboard"
  ];

  // Se muestra solo si la ruta actual es exactamente una de las principales
  const shouldShowNav = showNavRoutes.includes(pathname);
  const isChatRoute = pathname.startsWith("/chat");
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <MobileShell 
      mainClassName={cn(
        shouldShowNav ? "pb-24" : "pb-0",
        isChatRoute && "overflow-hidden h-full"
      )}
      bottomNav={shouldShowNav ? <BottomNav role={role} /> : undefined}
    >
      <div className={cn("flex-1 flex flex-col min-h-0", isChatRoute && "h-full")}>
        {children}
      </div>
    </MobileShell>
  );
}
