import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Stethoscope, Calendar, Users, FileText, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Livia Health — Doctor Portal" },
      { name: "description", content: "The clinical workspace for Livia Health doctors. Manage appointments, patients, prescriptions, and records in one place." },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Livia Health</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Doctor Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-20">
        <section className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure clinical workspace
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
              Your practice,<br />beautifully organized.
            </h1>
            <p className="mt-5 max-w-md text-muted-foreground">
              The Livia Health Doctor Portal brings every appointment, patient record, prescription and consultation note into a single calm workspace.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/auth" className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Get started</Link>
              <Link to="/auth" className="inline-flex items-center rounded-md border border-input px-5 py-2.5 text-sm font-medium hover:bg-accent">Sign in</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Calendar, title: "Appointments", desc: "Accept, reject, reschedule." },
              { icon: Users, title: "Patients", desc: "Full clinical history." },
              { icon: FileText, title: "Prescriptions", desc: "Issue in seconds." },
              { icon: Stethoscope, title: "SOAP notes", desc: "Structured consultations." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <f.icon className="h-5 w-5 text-primary" />
                <div className="mt-3 text-sm font-semibold">{f.title}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
