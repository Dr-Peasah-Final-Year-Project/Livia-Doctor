import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", user.id],
    queryFn: async () => {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
      const [pending, today, patients, completed] = await Promise.all([
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("appointments").select("id", { count: "exact", head: true }).gte("scheduled_at", todayStart.toISOString()).lte("scheduled_at", todayEnd.toISOString()),
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "completed"),
      ]);
      return {
        pending: pending.count ?? 0,
        today: today.count ?? 0,
        patients: patients.count ?? 0,
        completed: completed.count ?? 0,
      };
    },
  });

  const { data: upcoming } = useQuery({
    queryKey: ["dashboard-upcoming", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("id, scheduled_at, status, reason, patients(full_name)")
        .gte("scheduled_at", new Date().toISOString())
        .in("status", ["pending", "accepted", "rescheduled"])
        .order("scheduled_at", { ascending: true })
        .limit(6);
      return data ?? [];
    },
  });

  const cards = [
    { label: "Today", value: stats?.today ?? "—", icon: Calendar },
    { label: "Pending", value: stats?.pending ?? "—", icon: Clock },
    { label: "Patients", value: stats?.patients ?? "—", icon: Users },
    { label: "Completed", value: stats?.completed ?? "—", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Here's what's happening in your practice today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</div>
                <div className="mt-1 text-2xl font-semibold">{c.value}</div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                <c.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Upcoming appointments</CardTitle>
          <Link to="/appointments" className="text-xs text-primary hover:underline">View all</Link>
        </CardHeader>
        <CardContent>
          {!upcoming?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No upcoming appointments.</p>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{a.patients?.full_name ?? "Patient"}</div>
                    <div className="text-xs text-muted-foreground">{a.reason || "Consultation"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-muted-foreground">{format(new Date(a.scheduled_at), "PPp")}</div>
                    <Badge variant="outline" className="capitalize">{a.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
