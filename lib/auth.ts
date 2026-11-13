import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MemberRole } from "@/lib/supabase/database.types";
import { isStripeConfigured } from "@/lib/env";
import { billingState, type BillingState } from "@/lib/billing";

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

/**
 * The camp's billing state, or null when billing isn't configured (demo mode,
 * CI, no Stripe keys): then nothing is gated.
 */
export async function getCampBilling(
  supabase: CampContext["supabase"],
  campId: string
): Promise<BillingState | null> {
  if (!isStripeConfigured()) return null;
  const { data: camp } = await supabase
    .from("camps")
    .select("subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id")
    .eq("id", campId)
    .maybeSingle();
  return camp ? billingState(camp) : null;
}

/**
 * Like requireCamp, for anything that changes data. Once the trial has ended
 * without an active subscription the camp is read-only: data stays, but
 * changes are refused and the user is sent to the billing page.
 */
export async function requireWritableCamp(): Promise<CampContext> {
  const ctx = await requireCamp();
  const billing = await getCampBilling(ctx.supabase, ctx.campId);
  if (billing?.readOnly) redirect("/settings/billing?locked=1");
  return ctx;
}
