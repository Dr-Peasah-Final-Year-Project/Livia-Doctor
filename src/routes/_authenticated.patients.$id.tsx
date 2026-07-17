import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, FileText, Pill, NotebookPen, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/patients/$id")({ component: PatientDetail });

function PatientDetail() {
  const { id } = Route.useParams();
  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => (await supabase.from("patients").select("*").eq("id", id).maybeSingle()).data,
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!patient) return <div className="text-sm">Patient not found.</div>;

  const ageYears = patient.date_of_birth
    ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  return (
    <div className="space-y-6">
      <Link to="/patients" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> All patients
      </Link>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h1 className="text-2xl font-semibold">{patient.full_name}</h1>
            <div className="mt-1 text-xs text-muted-foreground">
              {[ageYears && `${ageYears} yrs`, patient.gender, patient.phone, patient.email].filter(Boolean).join(" · ")}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records"><FileText className="mr-1 h-4 w-4" /> Records</TabsTrigger>
          <TabsTrigger value="prescriptions"><Pill className="mr-1 h-4 w-4" /> Prescriptions</TabsTrigger>
          <TabsTrigger value="notes"><NotebookPen className="mr-1 h-4 w-4" /> Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Clinical info</CardTitle></CardHeader>
            <CardContent className="grid gap-4 text-sm md:grid-cols-2">
              <Info label="Blood type">{patient.blood_type ?? "—"}</Info>
              <Info label="Allergies">{patient.allergies ?? "—"}</Info>
              <Info label="Address" wide>{patient.address ?? "—"}</Info>
              <Info label="Medical history" wide>{patient.medical_history ?? "—"}</Info>
              <Info label="Emergency contact">{patient.emergency_contact_name ?? "—"}</Info>
              <Info label="Emergency phone">{patient.emergency_contact_phone ?? "—"}</Info>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="mt-4"><RecordsSection patientId={id} /></TabsContent>
        <TabsContent value="prescriptions" className="mt-4"><PrescriptionsSection patientId={id} /></TabsContent>
        <TabsContent value="notes" className="mt-4"><NotesSection patientId={id} /></TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function RecordsSection({ patientId }: { patientId: string }) {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["records", patientId],
    queryFn: async () => (await supabase.from("medical_records").select("*").eq("patient_id", patientId).order("record_date", { ascending: false })).data ?? [],
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", diagnosis: "", record_date: new Date().toISOString().slice(0, 10) });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("medical_records").insert({ ...form, patient_id: patientId, doctor_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Record added"); qc.invalidateQueries({ queryKey: ["records"] }); setOpen(false); setForm({ title: "", description: "", diagnosis: "", record_date: new Date().toISOString().slice(0, 10) }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from("medical_records").delete().eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["records"] }),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Medical records</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New record</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Diagnosis</Label><Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <DialogFooter><Button disabled={!form.title || create.isPending} onClick={() => create.mutate()}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!data?.length ? <p className="py-6 text-center text-sm text-muted-foreground">No records yet.</p> : (
          <ul className="divide-y divide-border">
            {data.map((r) => (
              <li key={r.id} className="flex items-start justify-between py-3">
                <div>
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(r.record_date), "PP")}{r.diagnosis && ` · ${r.diagnosis}`}</div>
                  {r.description && <div className="mt-1 text-sm">{r.description}</div>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function PrescriptionsSection({ patientId }: { patientId: string }) {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["prescriptions", patientId],
    queryFn: async () => (await supabase.from("prescriptions").select("*").eq("patient_id", patientId).order("issued_at", { ascending: false })).data ?? [],
  });
  const [open, setOpen] = useState(false);
  const [meds, setMeds] = useState<{ name: string; dosage: string; frequency: string }[]>([{ name: "", dosage: "", frequency: "" }]);
  const [instructions, setInstructions] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const cleaned = meds.filter((m) => m.name.trim());
      if (!cleaned.length) throw new Error("Add at least one medication");
      const { error } = await supabase.from("prescriptions").insert({
        doctor_id: user.id, patient_id: patientId, medications: cleaned, instructions,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Prescription created"); qc.invalidateQueries({ queryKey: ["prescriptions"] }); setOpen(false); setMeds([{ name: "", dosage: "", frequency: "" }]); setInstructions(""); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from("prescriptions").delete().eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prescriptions"] }),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Prescriptions</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> New</Button></DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>New prescription</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {meds.map((m, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <Input placeholder="Medication" value={m.name} onChange={(e) => setMeds(meds.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                  <Input placeholder="Dosage" value={m.dosage} onChange={(e) => setMeds(meds.map((x, j) => j === i ? { ...x, dosage: e.target.value } : x))} />
                  <Input placeholder="Frequency" value={m.frequency} onChange={(e) => setMeds(meds.map((x, j) => j === i ? { ...x, frequency: e.target.value } : x))} />
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setMeds([...meds, { name: "", dosage: "", frequency: "" }])}><Plus className="mr-1 h-4 w-4" /> Add medication</Button>
              <div className="space-y-2"><Label>Instructions</Label><Textarea rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} /></div>
            </div>
            <DialogFooter><Button disabled={create.isPending} onClick={() => create.mutate()}>Issue prescription</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!data?.length ? <p className="py-6 text-center text-sm text-muted-foreground">No prescriptions yet.</p> : (
          <ul className="divide-y divide-border">
            {data.map((p) => (
              <li key={p.id} className="flex items-start justify-between py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">{format(new Date(p.issued_at), "PP")}</div>
                  <ul className="mt-1 space-y-0.5 text-sm">
                    {(p.medications as any[]).map((m: any, i: number) => (
                      <li key={i}>• <span className="font-medium">{m.name}</span> {m.dosage && `— ${m.dosage}`} {m.frequency && `(${m.frequency})`}</li>
                    ))}
                  </ul>
                  {p.instructions && <div className="mt-1 text-xs text-muted-foreground">{p.instructions}</div>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function NotesSection({ patientId }: { patientId: string }) {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notes", patientId],
    queryFn: async () => (await supabase.from("consultation_notes").select("*").eq("patient_id", patientId).order("created_at", { ascending: false })).data ?? [],
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subjective: "", objective: "", assessment: "", plan: "" });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("consultation_notes").insert({ ...form, patient_id: patientId, doctor_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Note added"); qc.invalidateQueries({ queryKey: ["notes"] }); setOpen(false); setForm({ subjective: "", objective: "", assessment: "", plan: "" }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from("consultation_notes").delete().eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Consultation notes (SOAP)</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add note</Button></DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>New consultation note</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              {(["subjective", "objective", "assessment", "plan"] as const).map((k) => (
                <div key={k} className="space-y-2">
                  <Label className="capitalize">{k}</Label>
                  <Textarea rows={2} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                </div>
              ))}
            </div>
            <DialogFooter><Button disabled={create.isPending} onClick={() => create.mutate()}>Save note</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!data?.length ? <p className="py-6 text-center text-sm text-muted-foreground">No notes yet.</p> : (
          <ul className="divide-y divide-border">
            {data.map((n) => (
              <li key={n.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{format(new Date(n.created_at), "PPp")}</div>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(n.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                  {(["subjective", "objective", "assessment", "plan"] as const).map((k) => n[k] && (
                    <div key={k}><div className="text-xs uppercase text-muted-foreground">{k}</div><div>{n[k]}</div></div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
