import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const Route = createFileRoute("/_authenticated/availability")({ component: AvailabilityPage });

function AvailabilityPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: slots } = useQuery({
    queryKey: ["availability", user.id],
    queryFn: async () => (await supabase.from("doctor_availability").select("*").eq("doctor_id", user.id).order("day_of_week").order("start_time")).data ?? [],
  });

  const [day, setDay] = useState("1");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("doctor_availability").insert({
        doctor_id: user.id, day_of_week: Number(day), start_time: start, end_time: end,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Slot added"); qc.invalidateQueries({ queryKey: ["availability"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("doctor_availability").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from("doctor_availability").delete().eq("id", id); },
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["availability"] }); },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Availability</h1>
        <p className="text-sm text-muted-foreground">Set the weekly hours patients can book.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Add slot</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Day</Label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Start</Label><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div className="space-y-2"><Label>End</Label><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          <div className="flex items-end"><Button onClick={() => add.mutate()} className="w-full"><Plus className="mr-1 h-4 w-4" /> Add</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Weekly schedule</CardTitle></CardHeader>
        <CardContent>
          {!slots?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No slots yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {slots.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{DAYS[s.day_of_week]}</div>
                    <div className="text-xs text-muted-foreground">{s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={s.is_active} onCheckedChange={(v) => toggle.mutate({ id: s.id, is_active: v })} />
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(s.id)}><Trash2 className="h-4 w-4" /></Button>
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
