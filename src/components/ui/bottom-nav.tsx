"use client";

import { Home, Dumbbell, MessageCircle, User, Calendar, Users, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getUnreadMessagesCount } from "@/app/actions/chat-actions";

interface BottomNavProps {
  role?: string;
}

const userNavItems = [
  { label: "INICIO", icon: Home, path: "/dashboard", id: "DASH" },
  { label: "FITNESS", icon: Dumbbell, path: "/exercises", id: "EXER" },
  { label: "AURA_AI", icon: MessageCircle, path: "/chat", id: "CHAT" },
  { label: "TERAPIA", icon: Calendar, path: "/therapy", id: "THER" },
  { label: "PERFIL", icon: User, path: "/profile", id: "PROF" },
];

const psychologistNavItems = [
  { label: "INICIO", icon: Home, path: "/dashboard", id: "DASH" },
  { label: "PACIENTES", icon: Users, path: "/psychologist/patients", id: "PATS" },
  { label: "CITAS", icon: Calendar, path: "/therapy", id: "THER" },
  { label: "PERFIL", icon: User, path: "/profile", id: "PROF" },
];

const adminNavItems = [
  { label: "INICIO", icon: Home, path: "/dashboard", id: "DASH" },
  { label: "PANEL", icon: Shield, path: "/admin/dashboard", id: "ADMIN" },
  { label: "PERFIL", icon: User, path: "/profile", id: "PROF" },
];

export const BottomNav = ({ role = "usuario" }: BottomNavProps) => {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkUnread = async () => {
      const count = await getUnreadMessagesCount();
      setUnreadCount(count);
    };
    checkUnread();
    // Revisar cada 10 segundos para mayor fluidez
    const interval = setInterval(checkUnread, 10000);
    return () => clearInterval(interval);
  }, [pathname]);
  
  const navItems = role === "psicologo" 
    ? psychologistNavItems 
    : role === "admin" 
      ? adminNavItems 
      : userNavItems;

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-[75px] z-50 flex justify-center pb-safe">
      {/* Fondo SVG Cóncavo */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full fill-white dark:fill-zinc-950 filter drop-shadow-[0_-5px_15px_rgba(0,0,0,0.05)]"
          preserveAspectRatio="none"
        >
          <path d="M0,0 L35,0 C42,0 40,40 50,40 C60,40 58,0 65,0 L100,0 L100,100 L0,100 Z" />
        </svg>
      </div>

      <div className="relative w-full h-full flex justify-around items-center px-4 pt-1 z-10">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const isAura = item.id === "CHAT";
          const hasNotification = unreadCount > 0 && (item.id === "PATS" || item.id === "THER");
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={cn(
                "relative flex flex-col items-center transition-all duration-300",
                isAura ? "flex-[1.2] -top-5" : "flex-1 pt-1"
              )}
            >
              <div className={cn(
                "transition-all duration-300 flex items-center justify-center relative",
                isAura 
                  ? "w-14 h-14 rounded-full bg-[#B7B1F2] text-white shadow-xl shadow-[#B7B1F2]/30 border-[4px] border-white dark:border-zinc-950" 
                  : "p-1.5 rounded-xl",
                isActive && !isAura && "text-[#B7B1F2]",
                !isActive && !isAura && "text-zinc-400 dark:text-zinc-600 hover:text-[#B7B1F2]"
              )}>
                <item.icon className={cn(
                  isAura ? "w-7 h-7" : "w-6 h-6",
                )} />
                
                {/* Punto de Notificación (Aviso) */}
                {hasNotification && !isActive && (
                  <span className={cn(
                    "absolute w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-950",
                    isAura ? "top-1 right-1" : "top-0 right-0"
                  )} />
                )}

                {isActive && !isAura && (
                  <motion.div 
                    layoutId="nav-dot"
                    className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#A7E6D7] rounded-full border border-white dark:border-zinc-950 shadow-sm z-20"
                  />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-black transition-all duration-300 tracking-tighter mt-1",
                isActive || isAura ? "text-[#B7B1F2]" : "text-zinc-400 dark:text-zinc-600"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
