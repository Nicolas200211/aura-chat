import { MobileShell } from "@/components/layout/mobile-shell";
import { NavWrapper } from "@/components/ui/nav-wrapper";
import { getAuthenticatedUser } from "@/app/actions/content-actions";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();
  const role = user?.role ?? "usuario";

  return (
    <MobileShell bottomNav={<NavWrapper role={role} />}>
      {children}
    </MobileShell>
  );
}
