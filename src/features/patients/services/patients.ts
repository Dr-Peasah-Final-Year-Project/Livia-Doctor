import { supabase } from "@/lib/supabase";

export interface Patient {
  id: string;
  name: string;
  phone: string | null;
  date_of_birth: string | null;
  last_visit: string | null;
  appointments_count: number;
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

export { calculateAge };

export async function getPatients(doctorId: string): Promise<Patient[]> {
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("patient_id, appointment_date, patient:patient_id(id, name, phone, date_of_birth)")
    .eq("doctor_id", doctorId);

  if (error) throw error;

  const patientMap = new Map<string, Patient>();

  for (const apt of appointments ?? []) {
    const patientData = Array.isArray(apt.patient) ? apt.patient[0] : apt.patient;
    if (!patientData) continue;

    const existing = patientMap.get(apt.patient_id);

    if (!existing) {
      patientMap.set(apt.patient_id, {
        id: patientData.id,
        name: patientData.name ?? "Unknown",
        phone: patientData.phone ?? null,
        date_of_birth: patientData.date_of_birth ?? null,
        last_visit: apt.appointment_date,
        appointments_count: 1,
      });
    } else {
      existing.appointments_count++;
      if (apt.appointment_date > existing.last_visit!) {
        existing.last_visit = apt.appointment_date;
      }
    }
  }

  return Array.from(patientMap.values()).sort((a, b) =>
    (b.last_visit ?? "").localeCompare(a.last_visit ?? "")
  );
}
