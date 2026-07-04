"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

function revalidatePeople() {
  revalidatePath("/people/campers");
  revalidatePath("/people/guardians");
  revalidatePath("/people/staff");
}

// --- Guardians -------------------------------------------------------------

export async function createGuardian(formData: FormData) {
  const { supabase, user } = await requireUser();

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  if (!firstName || !lastName) return;

  await supabase.from("guardians").insert({
    user_id: user.id,
    first_name: firstName,
    last_name: lastName,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    relationship: String(formData.get("relationship") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  revalidatePeople();
}

export async function updateGuardian(id: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  if (!firstName || !lastName) return;

  await supabase
    .from("guardians")
    .update({
      first_name: firstName,
      last_name: lastName,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      relationship: String(formData.get("relationship") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePeople();
  redirect("/people/guardians");
}

export async function deleteGuardian(id: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("guardians").delete().eq("id", id).eq("user_id", user.id);
  revalidatePeople();
  redirect("/people/guardians");
}

// --- Campers -----------------------------------------------------------------

export async function createCamper(formData: FormData) {
  const { supabase, user } = await requireUser();

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  if (!firstName || !lastName) return;

  const ageRaw = String(formData.get("age") ?? "").trim();
  const age = ageRaw ? Number(ageRaw) : null;
  const guardianId = String(formData.get("guardian_id") ?? "").trim() || null;

  await supabase.from("campers").insert({
    user_id: user.id,
    first_name: firstName,
    last_name: lastName,
    cabin: String(formData.get("cabin") ?? "").trim() || null,
    age: age !== null && Number.isFinite(age) ? age : null,
    guardian_id: guardianId,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  revalidatePeople();
}

export async function updateCamper(id: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  if (!firstName || !lastName) return;

  const ageRaw = String(formData.get("age") ?? "").trim();
  const age = ageRaw ? Number(ageRaw) : null;
  const guardianId = String(formData.get("guardian_id") ?? "").trim() || null;

  await supabase
    .from("campers")
    .update({
      first_name: firstName,
      last_name: lastName,
      cabin: String(formData.get("cabin") ?? "").trim() || null,
      age: age !== null && Number.isFinite(age) ? age : null,
      guardian_id: guardianId,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePeople();
  redirect("/people/campers");
}

export async function deleteCamper(id: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("campers").delete().eq("id", id).eq("user_id", user.id);
  revalidatePeople();
  redirect("/people/campers");
}

// --- Staff -------------------------------------------------------------------

export async function createStaff(formData: FormData) {
  const { supabase, user } = await requireUser();

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  if (!firstName || !lastName) return;

  await supabase.from("staff").insert({
    user_id: user.id,
    first_name: firstName,
    last_name: lastName,
    role: String(formData.get("role") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  revalidatePeople();
}

export async function updateStaff(id: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  if (!firstName || !lastName) return;

  await supabase
    .from("staff")
    .update({
      first_name: firstName,
      last_name: lastName,
      role: String(formData.get("role") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePeople();
  redirect("/people/staff");
}

export async function deleteStaff(id: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("staff").delete().eq("id", id).eq("user_id", user.id);
  revalidatePeople();
  redirect("/people/staff");
}
