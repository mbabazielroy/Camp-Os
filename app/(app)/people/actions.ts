"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCamp } from "@/lib/auth";
import { field } from "@/lib/form";

function revalidatePeople() {
  revalidatePath("/people/campers");
  revalidatePath("/people/guardians");
  revalidatePath("/people/staff");
}

// --- Guardians -------------------------------------------------------------

export async function createGuardian(formData: FormData) {
  const { supabase, campId } = await requireCamp();

  const firstName = field(formData, "first_name").trim();
  const lastName = field(formData, "last_name").trim();
  if (!firstName || !lastName) return;

  await supabase.from("guardians").insert({
    camp_id: campId,
    first_name: firstName,
    last_name: lastName,
    email: field(formData, "email").trim() || null,
    phone: field(formData, "phone").trim() || null,
    relationship: field(formData, "relationship").trim() || null,
    notes: field(formData, "notes").trim() || null,
  });

  revalidatePeople();
}

export async function updateGuardian(id: string, formData: FormData) {
  const { supabase, campId } = await requireCamp();

  const firstName = field(formData, "first_name").trim();
  const lastName = field(formData, "last_name").trim();
  if (!firstName || !lastName) return;

  await supabase
    .from("guardians")
    .update({
      first_name: firstName,
      last_name: lastName,
      email: field(formData, "email").trim() || null,
      phone: field(formData, "phone").trim() || null,
      relationship: field(formData, "relationship").trim() || null,
      notes: field(formData, "notes").trim() || null,
    })
    .eq("id", id)
    .eq("camp_id", campId);

  revalidatePeople();
  redirect("/people/guardians");
}

export async function deleteGuardian(id: string) {
  const { supabase, campId } = await requireCamp();
  await supabase.from("guardians").delete().eq("id", id).eq("camp_id", campId);
  revalidatePeople();
  redirect("/people/guardians");
}

// --- Campers -----------------------------------------------------------------

export async function createCamper(formData: FormData) {
  const { supabase, campId } = await requireCamp();

  const firstName = field(formData, "first_name").trim();
  const lastName = field(formData, "last_name").trim();
  if (!firstName || !lastName) return;

  const ageRaw = field(formData, "age").trim();
  const age = ageRaw ? Number(ageRaw) : null;
  const guardianId = field(formData, "guardian_id").trim() || null;

  await supabase.from("campers").insert({
    camp_id: campId,
    first_name: firstName,
    last_name: lastName,
    cabin: field(formData, "cabin").trim() || null,
    age: age !== null && Number.isFinite(age) ? age : null,
    guardian_id: guardianId,
    notes: field(formData, "notes").trim() || null,
  });

  revalidatePeople();
}

export async function updateCamper(id: string, formData: FormData) {
  const { supabase, campId } = await requireCamp();

  const firstName = field(formData, "first_name").trim();
  const lastName = field(formData, "last_name").trim();
  if (!firstName || !lastName) return;

  const ageRaw = field(formData, "age").trim();
  const age = ageRaw ? Number(ageRaw) : null;
  const guardianId = field(formData, "guardian_id").trim() || null;

  await supabase
    .from("campers")
    .update({
      first_name: firstName,
      last_name: lastName,
      cabin: field(formData, "cabin").trim() || null,
      age: age !== null && Number.isFinite(age) ? age : null,
      guardian_id: guardianId,
      notes: field(formData, "notes").trim() || null,
    })
    .eq("id", id)
    .eq("camp_id", campId);

  revalidatePeople();
  redirect("/people/campers");
}

export async function deleteCamper(id: string) {
  const { supabase, campId } = await requireCamp();
  await supabase.from("campers").delete().eq("id", id).eq("camp_id", campId);
  revalidatePeople();
  redirect("/people/campers");
}

// --- Staff -------------------------------------------------------------------

export async function createStaff(formData: FormData) {
  const { supabase, campId } = await requireCamp();

  const firstName = field(formData, "first_name").trim();
  const lastName = field(formData, "last_name").trim();
  if (!firstName || !lastName) return;

  await supabase.from("staff").insert({
    camp_id: campId,
    first_name: firstName,
    last_name: lastName,
    role: field(formData, "role").trim() || null,
    email: field(formData, "email").trim() || null,
    phone: field(formData, "phone").trim() || null,
    notes: field(formData, "notes").trim() || null,
  });

  revalidatePeople();
}

export async function updateStaff(id: string, formData: FormData) {
  const { supabase, campId } = await requireCamp();

  const firstName = field(formData, "first_name").trim();
  const lastName = field(formData, "last_name").trim();
  if (!firstName || !lastName) return;

  await supabase
    .from("staff")
    .update({
      first_name: firstName,
      last_name: lastName,
      role: field(formData, "role").trim() || null,
      email: field(formData, "email").trim() || null,
      phone: field(formData, "phone").trim() || null,
      notes: field(formData, "notes").trim() || null,
    })
    .eq("id", id)
    .eq("camp_id", campId);

  revalidatePeople();
  redirect("/people/staff");
}

export async function deleteStaff(id: string) {
  const { supabase, campId } = await requireCamp();
  await supabase.from("staff").delete().eq("id", id).eq("camp_id", campId);
  revalidatePeople();
  redirect("/people/staff");
}
