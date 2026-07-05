"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCamp } from "@/lib/auth";

export async function updateCampName(formData: FormData) {
  const { supabase, campId, role } = await requireCamp();
  if (role !== "director") return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await supabase.from("camps").update({ name }).eq("id", campId);

  revalidatePath("/settings");
  revalidatePath("/", "layout");
}

export async function inviteMember(formData: FormData) {
  const { supabase, campId, userId, role } = await requireCamp();
  if (role !== "director") {
    redirect("/settings?error=" + encodeURIComponent("Only directors can invite teammates."));
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    redirect("/settings?error=" + encodeURIComponent("Enter a valid email address."));
  }

  const { error } = await supabase.from("camp_invites").insert({
    camp_id: campId,
    email,
    role: "staff",
    invited_by: userId,
  });

  if (error) {
    redirect(
      "/settings?error=" +
        encodeURIComponent(
          error.code === "23505"
            ? "That email has already been invited."
            : "Couldn't create the invite. Please try again."
        )
    );
  }

  revalidatePath("/settings");
  redirect(
    "/settings?notice=" +
      encodeURIComponent(
        `Invite created. When ${email} signs up for CampFlow with that email, they'll join your camp automatically.`
      )
  );
}

export async function revokeInvite(id: string) {
  const { supabase, campId, role } = await requireCamp();
  if (role !== "director") return;

  await supabase
    .from("camp_invites")
    .delete()
    .eq("id", id)
    .eq("camp_id", campId)
    .is("accepted_at", null);

  revalidatePath("/settings");
}

export async function disconnectGmail() {
  const { supabase, campId } = await requireCamp();

  await supabase.from("gmail_accounts").delete().eq("camp_id", campId);

  revalidatePath("/settings");
  revalidatePath("/email-assistant");
  redirect("/settings?notice=" + encodeURIComponent("Gmail disconnected."));
}
