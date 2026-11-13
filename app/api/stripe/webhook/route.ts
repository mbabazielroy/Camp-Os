import { NextResponse, type NextRequest } from "next/server";
import { isStripeConfigured } from "@/lib/env";
import { getStripe } from "@/lib/stripe/client";
import { handleStripeWebhook } from "@/lib/stripe/webhook";
import { campBillingStore } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe -> CampFlow. The signature is checked against the raw body before
// anything is read from it.
export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  }

  const payload = await request.text();
  try {
    const result = await handleStripeWebhook({
      payload,
      signature: request.headers.get("stripe-signature"),
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      webhooks: getStripe().webhooks,
      store: campBillingStore(),
    });
    return NextResponse.json({ message: result.message }, { status: result.status });
  } catch (error) {
    // A 500 makes Stripe retry the event later.
    console.error("Stripe webhook failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
