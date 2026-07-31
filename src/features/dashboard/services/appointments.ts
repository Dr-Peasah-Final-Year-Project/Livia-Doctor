import { supabase } from "@/lib/supabase";

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  reason: string | null;
  patient_age: number | null;
  patient_phone: string | null;
}

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function mapRow(row: any): Appointment {
  return {
    id: row.id,
    patient_id: row.patient_id,
    patient_name: row.patient?.name ?? "Unknown",
    appointment_date: row.appointment_date,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    notes: row.notes,
    reason: row.reason,
    patient_age: row.patient?.date_of_birth ? calculateAge(row.patient.date_of_birth) : null,
    patient_phone: row.patient?.phone ?? null,
  };
}

export async function getRecentAppointments(
  doctorId: string
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `id, patient_id, appointment_date, start_time, end_time, status, notes, reason, patient:patient_id(name, date_of_birth, phone)`
    )
    .eq("doctor_id", doctorId)
    .order("appointment_date", { ascending: false })
    .order("start_time", { ascending: false })
    .limit(3);

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getAllAppointments(
  doctorId: string
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `id, patient_id, appointment_date, start_time, end_time, status, notes, reason, patient:patient_id(name, date_of_birth, phone)`
    )
    .eq("doctor_id", doctorId)
    .order("appointment_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function updateAppointment(
  appointmentId: string,
  updates: { status?: string; notes?: string }
): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", appointmentId);

  if (error) throw error;
}

export async function getAppointmentStatusCounts(
  doctorId: string
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("appointments")
    .select("status")
    .eq("doctor_id", doctorId);

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}

export interface PatientPeriodData {
  label: string;
  patients: number;
}

export async function getPatientCountsByPeriod(
  doctorId: string
): Promise<{ weekly: PatientPeriodData[]; monthly: PatientPeriodData[] }> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { data, error } = await supabase
    .from("appointments")
    .select("patient_id, appointment_date")
    .eq("doctor_id", doctorId)
    .gte("appointment_date", startOfMonth.toISOString().split("T")[0])
    .lte("appointment_date", endOfMonth.toISOString().split("T")[0]);

  if (error) throw error;

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weeklyMap: Record<string, Set<string>> = {};
  for (const name of dayNames) {
    weeklyMap[name] = new Set();
  }
  for (const row of data ?? []) {
    const d = new Date(row.appointment_date + "T00:00:00");
    if (d >= startOfWeek && d <= endOfWeek) {
      const dayIndex = (d.getDay() + 6) % 7;
      weeklyMap[dayNames[dayIndex]].add(row.patient_id);
    }
  }
  const weekly = dayNames.map((name) => ({
    label: name,
    patients: weeklyMap[name].size,
  }));

  const monthStart = startOfMonth.getDate();
  const monthEnd = endOfMonth.getDate();
  const totalDays = monthEnd - monthStart + 1;
  const weeksInMonth = Math.ceil(totalDays / 7);

  const monthlyMap: Record<string, Set<string>> = {};
  for (let i = 0; i < weeksInMonth; i++) {
    monthlyMap[`Week ${i + 1}`] = new Set();
  }
  for (const row of data ?? []) {
    const d = new Date(row.appointment_date + "T00:00:00");
    const dayOfMonth = d.getDate() - monthStart;
    const weekIndex = Math.floor(dayOfMonth / 7);
    const key = `Week ${weekIndex + 1}`;
    if (monthlyMap[key]) {
      monthlyMap[key].add(row.patient_id);
    }
  }
  const monthly = Object.entries(monthlyMap).map(([label, patients]) => ({
    label,
    patients: patients.size,
  }));

  return { weekly, monthly };
}
