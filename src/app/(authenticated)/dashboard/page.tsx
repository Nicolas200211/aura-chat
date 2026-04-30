import { DashboardView } from "@/modules/dashboard/views/dashboard-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Aura Chat",
  description: "Tu resumen diario de bienestar en Aura Chat.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
