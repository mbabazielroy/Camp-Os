"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireCamp } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";

// Billing actions deliberately use requireCamp, not requireWritableCamp: a
// read-only camp must still be able to subscribe.

async function appOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function fail(message: string): never {
  redirect("/settings/billing?error=" + encodeURIComponent(message));
}

async function requireDirectorBilling() {
  if (!isStripeConfigured()) fail("Billing isn't configured.");
  const ctx = await requireCamp();
  if (ctx.role !== "director") fail("Only directors can manage billing.");
  const { data: camp } = await ctx.supabase
    .from("camps")
    .select("stripe_customer_id, stripe_subscription_id, subscription_status, trial_ends_at")
    .eq("id", ctx.campId)
    .maybeSingle();
  return { ...ctx, camp };
}

export async function startCheckout() {
  const { campId, userEmail, camp } = await requireDirectorBilling();
  // One subscription per camp: an existing one is changed in the portal.
  if (camp?.stripe_subscription_id && camp.subscription_status !== "canceled") {
    fail("This camp already has a subscription. Use Manage billing to change it.");
  }
  const origin = await appOrigin();

  // Subscribing during the free trial shouldn't cut it short: Stripe starts
  // charging when the CampFlow trial ends. Stripe needs a trial end at least
  // 48 hours out, so very late in the trial billing simply starts now.
  const trialEnd = camp ? Math.floor(new Date(camp.trial_ends_at).getTime() / 1000) : 0;
  const keepTrial = trialEnd > Math.floor(Date.now() / 1000) + 49 * 60 * 60;

  let url: string | null = null;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      client_reference_id: campId,
      metadata: { camp_id: campId },
      subscription_data: {
        metadata: { camp_id: campId },
        ...(keepTrial ? { trial_end: trialEnd } : {}),
      },
      ...(camp?.stripe_customer_id
        ? { customer: camp.stripe_customer_id }
        : userEmail
          ? { customer_email: userEmail }
          : {}),
      success_url: `${origin}/settings/billing?checkout=success`,
      cancel_url: `${origin}/settings/billing`,
    });
    url = session.url;
  } catch (error) {
    console.error("Stripe Checkout failed:", error instanceof Error ? error.message : error);
  }
  if (!url) fail("Couldn't start checkout. Please try again.");
  redirect(url);
}

export async function openBillingPortal() {
  const { camp } = await requireDirectorBilling();
  if (!camp?.stripe_customer_id) fail("Subscribe first to manage billing.");
  const origin = await appOrigin();

  let url: string | null = null;
  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: camp.stripe_customer_id,
      return_url: `${origin}/settings/billing`,
    });
    url = session.url;
  } catch (error) {
    console.error("Stripe portal failed:", error instanceof Error ? error.message : error);
  }
  if (!url) fail("Couldn't open the billing portal. Please try again.");
  redirect(url);
}
