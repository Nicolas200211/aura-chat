import { DashboardView } from "@/modules/dashboard/views/dashboard-view";
import { PsychologistDashboardView } from "@/modules/dashboard/views/psychologist-dashboard-view";
import { AdminHomeView } from "@/modules/admin/views/admin-home-view";
import { getMyProfile } from "@/app/actions/content-actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Aura Chat",
  description: "Tu resumen diario de bienestar en Aura Chat.",
};

export default async function DashboardPage() {
  const profile = await getMyProfile();

  if (profile?.role === "psicologo") {
    return <PsychologistDashboardView />;
  }

  if (profile?.role === "admin") {
    return <AdminHomeView />;
  }

  return <DashboardView />;
}
