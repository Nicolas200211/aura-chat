import { AdminDashboardView } from "@/modules/admin/views/admin-dashboard-view";
import { getMyProfile } from "@/app/actions/content-actions";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de Control | Aura Chat",
  description: "Administración del sistema Aura Chat.",
};

export default async function AdminDashboardPage() {
  const profile = await getMyProfile();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return <AdminDashboardView />;
}
