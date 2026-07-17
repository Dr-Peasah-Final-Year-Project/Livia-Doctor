import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useState } from "react";
import { Plus, CheckCircle2, XCircle, CalendarClock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/appointments")({ component: AppointmentsPage });

const STATUS_VARIANTS: Record<string, string> = {
  pending: "bg-warning/15 text-warning-foreground border border-warning/40",
  accepted: "bg-success/15 text-success-foreground border border-success/40",
  rejected: "bg-destructive/10 text-destructive border border-destructive/30",
  rescheduled: "bg-accent text-accent-foreground border border-border",
  completed: "bg-muted text-muted-foreground border border-border",
  cancelled: "bg-muted text-muted-foreground border border-border",
};

function AppointmentsPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data: appts } = useQuery({
    queryKey: ["appointments", user.id, filter],
    queryFn: async () => {
      let q = supabase.from("appointments").select("*, patients(id, full_name)").order("scheduled_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter as any);
      return (await q).data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async (vars: { id: string; patch: any }) => {
      const { error } = await supabase.from("appointments").update(vars.patch).eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground">Accept, reject or reschedule incoming requests.</p>
        </div>
        <NewAppointmentDialog />
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rescheduled">Rescheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {!appts?.length ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No appointments here.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {appts.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{a.patients?.full_name}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(a.scheduled_at), "PPpp")} · {a.duration_minutes}m</div>
                        {a.reason && <div className="mt-1 text-xs text-muted-foreground">{a.reason}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 text-xs capitalize ${STATUS_VARIANTS[a.status]}`}>{a.status}</span>
                        {a.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => update.mutate({ id: a.id, patch: { status: "accepted" } })}>
                              <CheckCircle2 className="mr-1 h-4 w-4" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => update.mutate({ id: a.id, patch: { status: "rejected" } })}>
                              <XCircle className="mr-1 h-4 w-4" /> Reject
                            </Button>
                          </>
                        )}
                        <RescheduleDialog id={a.id} current={a.scheduled_at} onSave={(iso) => update.mutate({ id: a.id, patch: { status: "rescheduled", scheduled_at: iso, rescheduled_from: a.scheduled_at } })} />
                        {(a.status === "accepted" || a.status === "rescheduled") && (
                          <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: a.id, patch: { status: "completed" } })}>Mark done</Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RescheduleDialog({ current, onSave }: { id: string; current: string; onSave: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(() => new Date(current).toISOString().slice(0, 16));
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost"><CalendarClock className="mr-1 h-4 w-4" /> Reschedule</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Reschedule appointment</DialogTitle><DialogDescription>Pick a new date and time.</DialogDescription></DialogHeader>
        <div className="space-y-2">
          <Label>New time</Label>
          <Input type="datetime-local" value={val} onChange={(e) => setVal(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { onSave(new Date(val).toISOString()); setOpen(false); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewAppointmentDialog() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [when, setWhen] = useState("");
  const [duration, setDuration] = useState("30");
  const [reason, setReason] = useState("");

  const { data: patients } = useQuery({
    queryKey: ["patients-min", user.id],
    queryFn: async () => (await supabase.from("patients").select("id, full_name").order("full_name")).data ?? [],
    enabled: open,
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("appointments").insert({
        doctor_id: user.id, patient_id: patientId, scheduled_at: new Date(when).toISOString(),
        duration_minutes: Number(duration), reason, status: "accepted",
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Appointment created"); qc.invalidateQueries({ queryKey: ["appointments"] }); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> New appointment</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New appointment</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>{patients?.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>When</Label><Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></div>
            <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Reason</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!patientId || !when || create.isPending} onClick={() => create.mutate()}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
