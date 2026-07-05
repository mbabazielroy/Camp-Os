import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MemberRole } from "@/lib/supabase/database.types";

export interface CampContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  userEmail: string | null;
  fullName: string | null;
  campId: string;
  role: MemberRole;
}

// Loads the signed-in user and the camp they belong to. Redirects to /login
// when signed out. Throws if the profile/camp is missing (schema trigger
// should always have created them).
export async function requireCamp(): Promise<CampContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("camp_id, role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.camp_id) {
    throw new Error(
      "No camp found for this account. Make sure supabase/schema.sql has been applied."
    );
  }

  return {
    supabase,
    userId: user.id,
    userEmail: user.email ?? null,
    fullName: profile.full_name,
    campId: profile.camp_id,
    role: profile.role,
  };
}
