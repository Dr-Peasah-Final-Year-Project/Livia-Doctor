import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { AuthContextType } from "@/lib/auth";

export const Route = createRootRouteWithContext<AuthContextType>()({
  component: () => <Outlet />,
});
