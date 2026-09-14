import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import type { AuthContextType } from "./lib/auth";

export const router = createRouter({
  routeTree,
  context: undefined! as AuthContextType,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
