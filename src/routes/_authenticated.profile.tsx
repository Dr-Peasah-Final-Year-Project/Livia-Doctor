import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["doctor-profile", user.id],
    queryFn: async () => (await supabase.from("doctor_profiles").select("*").eq("id", user.id).maybeSingle()).data,
  });

  const [form, setForm] = useState<Record<string, any>>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { id, created_at, updated_at, email, ...patch } = form;
      const { error } = await supabase.from("doctor_profiles").update(patch as any).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["doctor-profile"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading profile…</div>;

  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Information shown to patients booking with you.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Personal</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Full name"><Input value={form.full_name ?? ""} onChange={set("full_name")} /></Field>
          <Field label="Email"><Input value={form.email ?? ""} disabled /></Field>
          <Field label="Phone"><Input value={form.phone ?? ""} onChange={set("phone")} /></Field>
          <Field label="Specialty"><Input value={form.specialty ?? ""} onChange={set("specialty")} placeholder="e.g. Cardiology" /></Field>
          <Field label="License number"><Input value={form.license_number ?? ""} onChange={set("license_number")} /></Field>
          <Field label="Years of experience"><Input type="number" value={form.years_experience ?? ""} onChange={set("years_experience")} /></Field>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Practice</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Clinic name"><Input value={form.clinic_name ?? ""} onChange={set("clinic_name")} /></Field>
          <Field label="Consultation fee"><Input type="number" value={form.consultation_fee ?? ""} onChange={set("consultation_fee")} /></Field>
          <div className="md:col-span-2"><Field label="Clinic address"><Input value={form.clinic_address ?? ""} onChange={set("clinic_address")} /></Field></div>
          <div className="md:col-span-2"><Field label="Bio"><Textarea rows={4} value={form.bio ?? ""} onChange={set("bio")} /></Field></div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving…" : "Save changes"}</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
