import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { BillingPatch, CampBillingStore, SubscriptionTarget } from "@/lib/stripe/webhook";

// Service-role client: bypasses row level security. Server-only (webhooks and
// route handlers); never import this from a client component.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service role is not configured");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Stripe ids are plain [A-Za-z0-9_]; anything else is rejected before it goes
// into a PostgREST filter string.
const STRIPE_ID = /^[A-Za-z0-9_]+$/;

export function campBillingStore(
  admin: ReturnType<typeof createAdminClient> = createAdminClient()
): CampBillingStore {
  return {
    async updateCampById(campId: string, patch: BillingPatch) {
      const { data, error } = await admin.from("camps").update(patch).eq("id", campId).select("id");
      if (error) throw new Error(`Couldn't update camp billing: ${error.message}`);
      return data.length;
    },

    async updateCampForSubscription(target: SubscriptionTarget, patch: BillingPatch) {
      if (!STRIPE_ID.test(target.subscriptionId) || !STRIPE_ID.test(target.customerId)) {
        throw new Error("Unexpected Stripe id format");
      }
      let query = admin
        .from("camps")
        .update(patch)
        .or(`stripe_subscription_id.is.null,stripe_subscription_id.eq.${target.subscriptionId}`);
      query = target.campId
        ? query.eq("id", target.campId)
        : query.eq("stripe_customer_id", target.customerId);
      const { data, error } = await query.select("id");
      if (error) throw new Error(`Couldn't update camp billing: ${error.message}`);
      return data.length;
    },
  };
}
