import { ProfileView } from "@/modules/profile/views/profile-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Perfil | Aura Chat",
  description: "Gestiona tu cuenta y revisa tus logros en Aura Chat.",
};

export default function ProfilePage() {
  return <ProfileView />;
}
