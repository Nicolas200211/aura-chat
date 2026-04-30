"use client";

import { Home, Dumbbell, MessageCircle, User, Calendar, Activity } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { label: "INICIO", icon: Home, path: "/dashboard", id: "DASH" },
  { label: "FITNESS", icon: Dumbbell, path: "/exercises", id: "EXER" },
  { label: "AURA_AI", icon: MessageCircle, path: "/chat", id: "CHAT" },
  { label: "TERAPIA", icon: Calendar, path: "/therapy", id: "THER" },
  { label: "PERFIL", icon: User, path: "/profile", id: "PROF" },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-100 dark:border-white/5 px-2 py-3 z-50">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className="relative flex flex-col items-center gap-1.5 group min-w-[64px]"
            >
              <div className={cn(
                "p-2.5 rounded-xl transition-all duration-300 relative",
                isActive 
                  ? "bg-[#B7B1F2] text-white shadow-xl shadow-[#B7B1F2]/20 scale-110" 
                  : "text-zinc-400 dark:text-zinc-600 hover:text-[#B7B1F2] dark:hover:text-[#B7B1F2]/50"
              )}>
                <item.icon className="w-5 h-5" />
                {isActive && (
                  <motion.div 
                    layoutId="nav-dot"
                    className="absolute -top-1 -right-1 w-2 h-2 bg-[#A7E6D7] rounded-full border-2 border-white dark:border-zinc-950 shadow-sm"
                  />
                )}
              </div>
              <span className={cn(
                "text-[8px] font-mono font-black transition-all duration-300 tracking-widest",
                isActive ? "text-[#B7B1F2]" : "text-zinc-400 dark:text-zinc-600"
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
