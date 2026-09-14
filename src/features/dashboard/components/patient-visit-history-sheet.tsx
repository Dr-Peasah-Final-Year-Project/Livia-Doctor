import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { UserAvatar } from "@/features/dashboard/components/user-avatar";
import { getPatientAppointments, formatReason } from "@/features/dashboard/services/appointments";
import type { Appointment } from "@/features/dashboard/services/appointments";
import { supabase } from "@/lib/supabase";

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-500",
  scheduled: "bg-blue-500",
  cancelled: "bg-red-500",
  no_show: "bg-amber-500",
  needs_review: "bg-purple-500",
};

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const h = Number.parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${minutes} ${ampm}`;
}

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface PatientVisitHistorySheetProps {
  patientId: string;
  patientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientVisitHistorySheet({
  patientId,
  patientName,
  open,
  onOpenChange,
}: PatientVisitHistorySheetProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !patientId) return;

    async function fetchAppointments() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const data = await getPatientAppointments(user.id, patientId);
        setAppointments(data);
      } catch {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [open, patientId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Visit History</SheetTitle>
          <SheetDescription>
            Appointment records for {patientName}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No appointments found for this patient.
            </p>
          ) : (
            appointments.map((apt) => (
              <div
                key={apt.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {formatDate(apt.appointment_date)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize text-white ${STATUS_COLORS[apt.status] ?? "bg-muted"}`}
                  >
                    {apt.status.replace("_", " ")}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground">
                  {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Reason: </span>
                  {apt.reason ? formatReason(apt.reason) : "No reason provided"}
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Notes: </span>
                  {apt.notes ?? "No notes"}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
