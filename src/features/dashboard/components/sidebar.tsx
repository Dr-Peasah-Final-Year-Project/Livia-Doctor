import { useLocation, useRouter } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { LayoutDashboard, LogOut, Users, Calendar, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Patients", to: "/patients", icon: Users },
  { label: "Appointments", to: "/appointments", icon: Calendar },
  { label: "AI Tools", to: "/ai-tools", icon: BrainCircuit },
];

export function AppSidebar() {
  const location = useLocation();
  const router = useRouter();

  return (
    <aside className="hidden md:flex flex-col w-56 border-r h-full">
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === "/ai-tools"
              ? location.pathname.startsWith(item.to)
              : location.pathname === item.to;
          return (
            <a
              key={item.to}
              href={item.to}
              onClick={(e) => {
                e.preventDefault();
                router.navigate({ to: item.to });
              }}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-accent hover:bg-accent"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <Icon className={cn("size-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="p-3 border-t">
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="size-5 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
