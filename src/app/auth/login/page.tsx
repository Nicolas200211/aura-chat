import { LoginView } from "@/modules/auth/views/login-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | Aura Chat",
  description: "Ingresa a tu cuenta de Aura Chat para continuar tu viaje de bienestar.",
};

export default function LoginPage() {
  return <LoginView />;
}
