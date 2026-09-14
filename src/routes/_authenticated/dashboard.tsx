import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { getRecentAppointments, getAppointmentStatusCounts, getPatientCountsByPeriod, getMonthlyRevenue, formatReason } from "@/features/dashboard/services/appointments";
import type { Appointment } from "@/features/dashboard/services/appointments";
import { useAuth } from "@/lib/auth";
import { Banknote, CalendarDays, ChartLine, ChevronRight, Ellipsis } from "lucide-react";
import { UserAvatar } from "@/features/dashboard/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, CartesianGrid, BarChart, Bar, XAxis, YAxis, AreaChart, Area } from "recharts";
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { AppointmentDetailSheet } from "@/features/dashboard/components/appointment-detail-sheet";

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { appointments: [], statusCounts: {}, patientPeriodData: { weekly: [], monthly: [] }, revenueData: [] };
    const [appointments, statusCounts, patientPeriodData, revenueData] = await Promise.all([
      getRecentAppointments(user.id),
      getAppointmentStatusCounts(user.id),
      getPatientCountsByPeriod(user.id),
      getMonthlyRevenue(user.id),
    ]);
    return { appointments, statusCounts, patientPeriodData, revenueData };
  },
  component: DashboardPage,
  pendingComponent: DashboardSkeleton,
});

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-muted rounded" />
      <div className="h-4 w-48 bg-muted rounded mt-2" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 border rounded-lg p-4 h-48 bg-muted" />
        <div className="border rounded-lg p-4 h-48 bg-muted" />
        <div className="col-span-2 border rounded-lg p-4 h-48 bg-muted" />
      </div>
    </div>
  );
}

function DashboardPage() {
  const { appointments, statusCounts, patientPeriodData, revenueData } = Route.useLoaderData();
  const { user } = useAuth();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSave = (updated: Appointment) => {
    setSelectedAppointment(updated);
  };

  const displayName = user?.user_metadata?.name ?? "Doctor";

  const STATUS_LABELS: Record<string, string> = {
    completed: "Completed",
    scheduled: "Scheduled",
    cancelled: "Cancelled",
    no_show: "No Show",
    needs_review: "Needs Review",
  };

  const data = (["completed", "scheduled", "cancelled", "no_show", "needs_review"] as const).map(
    (status) => ({
      status,
      name: STATUS_LABELS[status],
      value: statusCounts[status] ?? 0,
    })
  );

  const STATUS_COLORS: Record<string, string> = {
    completed: "#10b981",
    scheduled: "#3b82f6",
    cancelled: "#ef4444",
    no_show: "#f59e0b",
    needs_review: "#a855f7",
  };


  type Period = "weekly" | "monthly";

  const dataByPeriod: Record<Period, typeof patientPeriodData.weekly> = {
    weekly: patientPeriodData.weekly,
    monthly: patientPeriodData.monthly,
  };
  const [period, setPeriod] = useState<Period>("weekly");

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

  const columns: ColumnDef<Appointment, unknown>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        return <p className="text-sm text-muted-foreground">
          {`#${row.original.id.slice(0, 8)}`}
        </p>;
      },
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
      cell: ({ row }) => formatReason(row.original.reason),
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
            <DropdownMenuItem onClick={() => {
              setSelectedAppointment(row.original);
              setSheetOpen(true);
            }}>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const recentAppointments = appointments.slice(0, 6);

  return (
    <div className="py-10 px-8 space-y-6 bg-accent min-h-full">
      <div>
        <h1 className="font-heading text-2xl">Welcome back, {displayName}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg min-h-40 flex flex-col bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" />
              <span className="">
                Appointments
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-2">
              {data.map((entry) => (
                <div key={entry.status} className="flex items-center gap-2 text-xs whitespace-nowrap">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[entry.status] }}
                  />
                  {entry.name}
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  paddingAngle={0}
                  cornerRadius={8}
                >
                  {data.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12 }}
                  itemStyle={{ fontSize: 12 }}
                  labelStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 border rounded-lg min-h-40 flex flex-col bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ChartLine className="size-5 text-primary" />
              <span>Patients</span>
            </div>

            <div className="flex gap-1">
                {(["weekly", "monthly"] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`text-[0.6rem] px-1 py-0.5 rounded-sm ${period === p
                      ? "bg-white text-primary border border-primary"
                      : "text-muted-foreground hover:bg-accent"
                      }`}
                  >
                    {p === "weekly" ? "This Week" : "This Month"}
                  </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={dataByPeriod[period]} margin={{ top: 5, right: 0, bottom: 0, left: -42 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12 }}
                itemStyle={{ fontSize: 12 }}
                labelStyle={{ fontSize: 12 }}
                cursor={false}
              />
              <Bar
                dataKey="patients"
                radius={[12, 12, 12, 12]}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {dataByPeriod[period].map((_, index) => (
                  <Cell
                    key={index}
                    fill={index === activeIndex ? "#3b82f6" : "oklch(0.809 0.105 251.813)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* <div className="p-4 border rounded-lg min-h-40 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UsersRound className="size-5 text-primary" />
              <span className="">
                Patients Stats
              </span>
            </div>
          </div>
        </div> */}

        <div className="col-span-2 p-4 border rounded-lg min-h-40 flex flex-col bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Banknote className="size-5 text-primary" />
              <span className="">
                Earnings
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, bottom: 0, left: -30 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis
                ticks={[0, 50, 100, 150, 200, 250, 300]}
                tickFormatter={(v) => `${v}`}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={{ fontSize: 12 }}
                itemStyle={{ fontSize: 12 }}
                labelStyle={{ fontSize: 12 }}
                formatter={(value) => [`GHS ${Number(value).toLocaleString()}`, "Earnings"]}
                cursor={false}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="col-span-3 border rounded-lg bg-white p-6">
        <div className="mb-6 rounded-t-lg bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />

            <div>
              <h2 className="font-heading text-lg">Upcoming Appointments</h2>
              <p className="text-sm text-muted-foreground">
                A list of your appointments for today.
              </p>
            </div>
          </div>

          <Link to="/appointments" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All
            <ChevronRight className="size-4" />
          </Link>
        </div>
        <DataTable columns={columns} data={recentAppointments} />
      </div>

      <AppointmentDetailSheet
        appointment={selectedAppointment}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSave}
      />
    </div >
  );
}
