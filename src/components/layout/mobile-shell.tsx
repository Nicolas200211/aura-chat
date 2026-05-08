import { cn } from "@/lib/utils";

interface MobileShellProps {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
  bottomNav?: React.ReactNode;
}

export function MobileShell({ children, className, mainClassName, bottomNav }: MobileShellProps) {
  return (
    <div className={cn("flex min-h-[100dvh] bg-zinc-50 dark:bg-black items-center justify-center sm:py-8", className)}>
      {/* El Shell es el "celular". Ocupa todo en móvil, pero simula un celular en escritorio */}
      <div className="w-full h-[100dvh] sm:max-w-md sm:h-[850px] sm:max-h-[90dvh] sm:rounded-[2rem] bg-[#F8F9FE] dark:bg-slate-950 flex flex-col relative overflow-hidden sm:shadow-2xl sm:border-[8px] sm:border-zinc-800 lg:dark:border-zinc-900 transition-all">
        <main className={cn("flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar relative", mainClassName)}>
          {children}
        </main>
        {bottomNav}
      </div>
    </div>
  );
}
