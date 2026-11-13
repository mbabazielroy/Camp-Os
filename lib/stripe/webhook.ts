// Turns verified Stripe webhook events into updates of a camp's billing
// columns. Storage is injected so this can be unit tested with recorded event
// fixtures; the route handler wires in the service-role Supabase client.

import type Stripe from "stripe";
import { mapStripeStatus } from "../billing";
import type { SubscriptionStatus } from "../supabase/database.types";

export interface BillingPatch {
  subscription_status?: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export interface SubscriptionTarget {
  /** From the subscription's `camp_id` metadata, set when Checkout created it. */
  campId: string | null;
  customerId: string;
  subscriptionId: string;
}

export interface CampBillingStore {
  /** Updates the camp with this id. Returns how many rows changed. */
  updateCampById(campId: string, patch: BillingPatch): Promise<number>;
  /**
   * Updates the camp a subscription belongs to (by camp id, else by Stripe
   * customer), unless that camp has since moved to a different subscription.
   * Returns how many rows changed.
   */
  updateCampForSubscription(target: SubscriptionTarget, patch: BillingPatch): Promise<number>;
}

export interface WebhookResult {
  status: number;
  message: string;
}

type Expandable = string | { id: string } | null | undefined;

function idOf(value: Expandable): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export const HANDLED_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
] as const;

export async function handleStripeWebhook(input: {
  payload: string;
  signature: string | null;
  webhookSecret: string;
  webhooks: Pick<Stripe["webhooks"], "constructEvent">;
  store: CampBillingStore;
}): Promise<WebhookResult> {
  const { payload, signature, webhookSecret, webhooks, store } = input;

  if (!signature) return { status: 400, message: "Missing Stripe-Signature header" };

  let event: Stripe.Event;
  try {
    event = webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return { status: 400, message: "Invalid signature" };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") return ignored(event);

      const campId = session.client_reference_id ?? session.metadata?.camp_id ?? null;
      const customerId = idOf(session.customer);
      const subscriptionId = idOf(session.subscription);
      if (!campId || !customerId || !subscriptionId) {
        // Not one of ours (e.g. created in the Stripe dashboard). Acknowledge it
        // so Stripe doesn't retry it for days.
        return { status: 200, message: "Ignored checkout session without camp, customer or subscription" };
      }

      const patch: BillingPatch = {
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
      };
      // Paid now means the subscription is active. With nothing to pay yet
      // (a Stripe-side trial) the status comes from customer.subscription.updated.
      if (session.payment_status === "paid") patch.subscription_status = "active";

      const updated = await store.updateCampById(campId, patch);
      return { status: 200, message: updated ? "Camp updated" : "No matching camp" };
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = idOf(subscription.customer);
      if (!customerId) return { status: 400, message: "Subscription has no customer" };

      const status =
        event.type === "customer.subscription.deleted"
          ? "canceled"
          : mapStripeStatus(subscription.status);

      const updated = await store.updateCampForSubscription(
        {
          campId: subscription.metadata?.camp_id || null,
          customerId,
          subscriptionId: subscription.id,
        },
        {
          subscription_status: status,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
        }
      );
      return { status: 200, message: updated ? "Camp updated" : "No matching camp" };
    }

    default:
      return ignored(event);
  }
}

function ignored(event: Stripe.Event): WebhookResult {
  return { status: 200, message: `Ignored ${event.type}` };
}
