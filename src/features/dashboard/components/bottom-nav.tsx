import { useLocation, useRouter } from "@tanstack/react-router";
import { LayoutDashboard, Users, Calendar, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", to: "/dashboard", icon: LayoutDashboard },
  { label: "Patients", to: "/patients", icon: Users },
  { label: "Appointments", to: "/appointments", icon: Calendar },
  { label: "AI Tools", to: "/ai-tools", icon: BrainCircuit },
];

export function MobileBottomNav() {
  const location = useLocation();
  const router = useRouter();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="flex items-center justify-around h-16 px-2">
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
                "flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors rounded-md",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
