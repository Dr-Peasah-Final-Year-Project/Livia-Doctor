import { AppSidebar } from "@/features/dashboard/components/sidebar";
import { MobileBottomNav } from "@/features/dashboard/components/bottom-nav";
import { UserAvatar } from "@/features/dashboard/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { createFileRoute, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/sign-in" });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.invalidate();
    }
  }, [user, isLoading, router]);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.name ?? "Doctor";

  return (
    <div className="flex flex-col h-svh">
      <header className="shrink-0 border-b px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 28 28"
              className="text-primary shrink-0"
            >
              <path
                fill="currentColor"
                d="M10.75 2.998A1.75 1.75 0 0 0 9 4.748V9H4.75A1.75 1.75 0 0 0 3 10.75v6.5c0 .966.784 1.75 1.75 1.75H9v4.251c0 .967.784 1.75 1.75 1.75h6.5a1.75 1.75 0 0 0 1.75-1.75V19h4.25A1.75 1.75 0 0 0 25 17.25v-6.5A1.75 1.75 0 0 0 23.25 9H19V4.748a1.75 1.75 0 0 0-1.75-1.75z"
              />
            </svg>
            <span className="font-heading font-medium text-lg whitespace-nowrap tracking-tight">
              Livia Health&trade;
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full">
            <UserAvatar src={avatarUrl} seed={user?.id ?? ""} size="lg" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-1.5 py-1.5">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.navigate({ to: "/profile" })}
            >
              <User />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
