"use client";

import { BottomNav } from "@/components/ui/bottom-nav";
import { usePathname } from "next/navigation";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Lista de rutas exactas donde SÍ se debe mostrar la navegación inferior
  const showNavRoutes = ["/dashboard", "/exercises", "/therapy", "/diary", "/profile"];
  
  // Se muestra solo si la ruta actual está en la lista de permitidas
  const shouldShowNav = showNavRoutes.includes(pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      {shouldShowNav && <BottomNav />}
    </div>
  );
}
