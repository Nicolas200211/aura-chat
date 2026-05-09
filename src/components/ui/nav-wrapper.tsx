"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./bottom-nav";

const showNavRoutes = [
  "/dashboard",
  "/exercises",
  "/therapy",
  "/diary",
  "/profile",
  "/chat/inbox",
  "/psychologist/patients",
  "/admin",
  "/admin/dashboard",
];

interface NavWrapperProps {
  role: string;
}

export function NavWrapper({ role }: NavWrapperProps) {
  const pathname = usePathname();
  if (!showNavRoutes.includes(pathname)) return null;
  return <BottomNav role={role} />;
}
