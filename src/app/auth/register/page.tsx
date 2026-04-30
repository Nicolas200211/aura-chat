import { RegisterView } from "@/modules/auth/views/register-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrarse | Aura Chat",
  description: "Crea una cuenta en Aura Chat y comienza a cuidar tu bienestar emocional.",
};

export default function RegisterPage() {
  return <RegisterView />;
}
