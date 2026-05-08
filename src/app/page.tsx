import { WelcomeView } from "@/modules/auth/views/welcome-view";
import { MobileShell } from "@/components/layout/mobile-shell";

export default function HomePage() {
  return (
    <MobileShell>
      <WelcomeView />
    </MobileShell>
  );
}
