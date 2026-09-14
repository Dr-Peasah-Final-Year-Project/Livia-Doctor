import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  date_of_birth: string | null;
  gender: string | null;
  role: string;
  medical_license_number: string | null;
  specialty_id: number | null;
  avatar_url: string | null;
  created_at: string;
  specialty: {
    id: number;
    name: string;
  } | null;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*, specialty:doctor_specialties(id, name)")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }

  return data as UserProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, "name" | "phone" | "avatar_url">>
): Promise<void> {
  const { error } = await supabase
    .from("user_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;
}
