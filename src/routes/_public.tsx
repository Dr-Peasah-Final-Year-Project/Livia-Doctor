import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_public")({
  beforeLoad: () => {
    throw redirect({ to: "/sign-in" });
  },
  component: HomePage,
});

function HomePage() {
  return null;
}
