// Billing rules shared by the billing page, the app layout and server actions.
// Pure functions only (no Stripe or Supabase calls) so they can be unit tested.

import type { SubscriptionStatus } from "./supabase/database.types";

export const TRIAL_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface CampBillingFields {
  subscription_status: SubscriptionStatus;
  trial_ends_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export interface BillingState {
  status: SubscriptionStatus;
  trialEndsAt: Date;
  /** Whole days left in the trial, 0 once it has ended. */
  trialDaysLeft: number;
  trialEnded: boolean;
  /** True when the camp may only read: the trial is over and it isn't paying. */
  readOnly: boolean;
  hasCustomer: boolean;
  /** A live (not canceled) Stripe subscription exists; change it in the portal. */
  hasSubscription: boolean;
}

export function billingState(camp: CampBillingFields, now: Date = new Date()): BillingState {
  const trialEndsAt = new Date(camp.trial_ends_at);
  const msLeft = trialEndsAt.getTime() - now.getTime();
  const trialEnded = msLeft <= 0;
  const hasSubscription =
    Boolean(camp.stripe_subscription_id) && camp.subscription_status !== "canceled";
  // A subscription still marked trialing is about to convert: Stripe's trial
  // ends at the same moment as ours, and the "active" webhook can lag a little.
  const paying =
    camp.subscription_status === "active" ||
    (hasSubscription && camp.subscription_status === "trialing");
  return {
    status: camp.subscription_status,
    trialEndsAt,
    trialDaysLeft: trialEnded ? 0 : Math.ceil(msLeft / DAY_MS),
    trialEnded,
    readOnly: trialEnded && !paying,
    hasCustomer: Boolean(camp.stripe_customer_id),
    hasSubscription,
  };
}

/**
 * Collapses Stripe's subscription statuses into the four CampFlow stores.
 * Anything that means "money isn't coming in" but might recover becomes
 * past_due; anything final becomes canceled.
 */
export function mapStripeStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    case "past_due":
    case "unpaid":
    case "incomplete":
    case "paused":
    default:
      return "past_due";
  }
}
