import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/features/dashboard/components/user-avatar";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { getPatients, calculateAge } from "@/features/patients/services/patients";
import type { Patient } from "@/features/patients/services/patients";

export const Route = createFileRoute("/_authenticated/patients")({
  loader: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    return getPatients(user.id);
  },
  component: PatientsPage,
  pendingComponent: PatientsSkeleton,
});

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const columns: ColumnDef<Patient, unknown>[] = [
  {
    accessorKey: "name",
    header: "Patient",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="flex items-center gap-3">
          <UserAvatar seed={patient.id} size="lg" />
          <span className="font-medium">{patient.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone ?? "-",
  },
  {
    accessorKey: "date_of_birth",
    header: "Age",
    cell: ({ row }) => {
      const dob = row.original.date_of_birth;
      if (!dob) return "-";
      return calculateAge(dob);
    },
  },
  {
    accessorKey: "last_visit",
    header: "Last Visit",
    cell: ({ row }) => {
      const lastVisit = row.original.last_visit;
      if (!lastVisit) return "-";
      return formatDate(lastVisit);
    },
  },
  {
    accessorKey: "appointments_count",
    header: "Appointments",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
        {row.original.appointments_count}
      </span>
    ),
  },
];

function PatientsSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-4 w-64 bg-muted rounded mt-1" />
      <div className="h-10 w-full bg-muted rounded" />
      <div className="bg-card border rounded-lg p-5 h-96 bg-muted" />
    </div>
  );
}

function PatientsPage() {
  const patients = Route.useLoaderData();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-medium">Patients</h1>
        <p className="text-muted-foreground text-sm">
          Manage your patient list
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search patients..."
          className="pl-9"
        />
      </div>

      <DataTable columns={columns} data={patients} />
    </div>
  );
}
