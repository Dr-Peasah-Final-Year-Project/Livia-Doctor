import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Ellipsis } from "lucide-react";
import { UserAvatar } from "@/features/dashboard/components/user-avatar";
import { getAllAppointments } from "@/features/dashboard/services/appointments";
import type { Appointment } from "@/features/dashboard/services/appointments";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppointmentDetailSheet } from "@/features/dashboard/components/appointment-detail-sheet";

export const Route = createFileRoute("/_authenticated/appointments")({
  loader: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    return getAllAppointments(user.id);
  },
  component: AppointmentsPage,
  pendingComponent: AppointmentsSkeleton,
});

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const h = Number.parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${minutes} ${ampm}`;
}

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AppointmentsSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-4 w-64 bg-muted rounded mt-1" />
      <div className="border rounded-lg p-5 h-96 bg-muted" />
    </div>
  );
}

function AppointmentsPage() {
  const initialAppointments = Route.useLoaderData();
  const [data, setData] = useState(initialAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSheetOpen(true);
  };

  const handleStatusChange = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const updated = await getAllAppointments(user.id);
    setData(updated);
    if (selectedAppointment) {
      const refreshed = updated.find((a) => a.id === selectedAppointment.id);
      if (refreshed) setSelectedAppointment(refreshed);
    }
  };

  const columns: ColumnDef<Appointment, unknown>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground">{`#${row.original.id.slice(0, 8)}`}</p>
      ),
    },
    {
      accessorKey: "appointment_date",
      header: "Date",
      cell: ({ row }) => {
        const apt = row.original;
        return (
          <div>
            <p className="text-sm">{formatDate(apt.appointment_date)}</p>
            <p className="text-xs text-muted-foreground">{formatTime(apt.start_time)}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "patient_name",
      header: "Patient Name",
      cell: ({ row }) => {
        const apt = row.original;
        return (
          <div className="flex items-center gap-2">
            <UserAvatar seed={apt.patient_id} />
            <div>
              <p className="text-sm">{apt.patient_name}</p>
              <p className="text-xs text-muted-foreground">{apt.patient_phone ?? "-"}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => row.original.reason ?? "-",
    },
    {
      accessorKey: "patient_age",
      header: "Patient Age",
      cell: ({ row }) => row.original.patient_age ?? "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusColors: Record<string, { bg: string; text: string }> = {
          completed: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
          scheduled: { bg: "bg-blue-500/10", text: "text-blue-500" },
          cancelled: { bg: "bg-red-500/10", text: "text-red-500" },
          no_show: { bg: "bg-amber-500/10", text: "text-amber-500" },
          needs_review: { bg: "bg-purple-500/10", text: "text-purple-500" },
        };
        const colors = statusColors[status] ?? { bg: "bg-muted", text: "text-muted-foreground" };
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors.bg} ${colors.text}`}>
            {status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 rounded-md hover:bg-muted">
            <Ellipsis className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-medium">Appointments</h1>
        <p className="text-muted-foreground text-sm">Your schedule for {today}</p>
      </div>

      <DataTable columns={columns} data={data} />

      <AppointmentDetailSheet
        appointment={selectedAppointment}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
