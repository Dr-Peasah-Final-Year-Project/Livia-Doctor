import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/features/dashboard/components/user-avatar";
import { updateAppointment } from "@/features/dashboard/services/appointments";
import type { Appointment } from "@/features/dashboard/services/appointments";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
  { value: "needs_review", label: "Needs Review" },
] as const;

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

interface AppointmentDetailSheetProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void;
}

export function AppointmentDetailSheet({
  appointment,
  open,
  onOpenChange,
  onStatusChange,
}: AppointmentDetailSheetProps) {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (appointment) {
      setStatus(appointment.status);
      setNotes(appointment.notes ?? "");
    }
  }, [appointment]);

  if (!appointment) return null;

  const hasChanges =
    status !== appointment.status || notes !== (appointment.notes ?? "");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAppointment(appointment.id, { status, notes });
      toast.success("Appointment updated");
      onStatusChange?.();
      onOpenChange(false);
    } catch {
      toast.error("Failed to update appointment");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Appointment Details</SheetTitle>
          <SheetDescription>
            View and manage appointment information
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
          <div className="flex items-center gap-4">
            <UserAvatar seed={appointment.patient_id} size="lg" />
            <div>
              <p className="font-medium">{appointment.patient_name}</p>
              <p className="text-sm text-muted-foreground">
                {appointment.patient_phone ?? "No phone"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <div className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full shrink-0 ${
                    STATUS_COLORS[status] ?? "bg-muted"
                  }`}
                />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                className="text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer focus:ring-2 focus:ring-ring bg-background"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm">{formatDate(appointment.appointment_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Time</span>
                <span className="text-sm">
                  {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Patient Age</span>
                <span className="text-sm">{appointment.patient_age ?? "-"}</span>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Reason</span>
                <p className="text-sm mt-1">{appointment.reason ?? "No reason provided"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  rows={3}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
