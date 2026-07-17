import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/patients")({ component: PatientsPage });

function PatientsPage() {
  const { user } = Route.useRouteContext();
  const [search, setSearch] = useState("");
  const { data: patients } = useQuery({
    queryKey: ["patients", user.id, search],
    queryFn: async () => {
      let q = supabase.from("patients").select("*").order("full_name");
      if (search) q = q.ilike("full_name", `%${search}%`);
      return (await q).data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
          <p className="text-sm text-muted-foreground">All people under your care.</p>
        </div>
        <NewPatientDialog />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search patients…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {!patients?.length ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No patients yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {patients.map((p) => (
                <li key={p.id}>
                  <Link to="/patients/$id" params={{ id: p.id }} className="flex items-center justify-between p-4 hover:bg-accent/40">
                    <div>
                      <div className="text-sm font-medium">{p.full_name}</div>
                      <div className="text-xs text-muted-foreground">{[p.gender, p.date_of_birth, p.phone].filter(Boolean).join(" · ")}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function NewPatientDialog() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ full_name: "", gender: "", phone: "", email: "", date_of_birth: "", medical_history: "", allergies: "" });
  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: typeof e === "string" ? e : e.target.value }));

  const create = useMutation({
    mutationFn: async () => {
      const payload: any = { doctor_id: user.id, full_name: form.full_name };
      for (const k of ["gender","phone","email","medical_history","allergies"]) if (form[k]) payload[k] = form[k];
      if (form.date_of_birth) payload.date_of_birth = form.date_of_birth;
      const { error } = await supabase.from("patients").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Patient added"); qc.invalidateQueries({ queryKey: ["patients"] }); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> Add patient</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New patient</DialogTitle></DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name"><Input required value={form.full_name} onChange={set("full_name")} /></Field>
          <Field label="Date of birth"><Input type="date" value={form.date_of_birth} onChange={set("date_of_birth")} /></Field>
          <Field label="Gender">
            <Select value={form.gender} onValueChange={set("gender")}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Phone"><Input value={form.phone} onChange={set("phone")} /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={set("email")} /></Field>
          <div className="md:col-span-2"><Field label="Allergies"><Input value={form.allergies} onChange={set("allergies")} /></Field></div>
          <div className="md:col-span-2"><Field label="Medical history"><Textarea rows={3} value={form.medical_history} onChange={set("medical_history")} /></Field></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!form.full_name || create.isPending} onClick={() => create.mutate()}>Add patient</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
