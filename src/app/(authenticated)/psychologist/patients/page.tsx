import { PatientsView } from "@/modules/psychologist/views/patients-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Pacientes | Aura Pro",
  description: "Gestión de pacientes para especialistas de Aura Chat.",
};

export default function PatientsPage() {
  return <PatientsView />;
}
