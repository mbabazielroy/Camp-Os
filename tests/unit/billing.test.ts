import { test } from "node:test";
import assert from "node:assert/strict";
import { billingState, mapStripeStatus } from "../../lib/billing";

const NOW = new Date("2026-11-12T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

function camp(
  status: "trialing" | "active" | "past_due" | "canceled",
  trialEndsInDays: number,
  subscriptionId: string | null = null
) {
  return {
    subscription_status: status,
    trial_ends_at: new Date(NOW.getTime() + trialEndsInDays * DAY).toISOString(),
    stripe_customer_id: subscriptionId ? "cus_1" : null,
    stripe_subscription_id: subscriptionId,
  };
}

test("a camp in its trial can write and sees the days left", () => {
  const state = billingState(camp("trialing", 29.5), NOW);
  assert.equal(state.readOnly, false);
  assert.equal(state.trialDaysLeft, 30);
});

test("an ended trial without an active subscription is read-only", () => {
  for (const status of ["trialing", "past_due", "canceled"] as const) {
    const state = billingState(camp(status, -1), NOW);
    assert.equal(state.readOnly, true, status);
    assert.equal(state.trialDaysLeft, 0);
  }
});

test("an active subscription is never read-only", () => {
  assert.equal(billingState(camp("active", -100), NOW).readOnly, false);
});

test("a subscription converting from its trial isn't locked while the webhook catches up", () => {
  assert.equal(billingState(camp("trialing", -0.01, "sub_1"), NOW).readOnly, false);
  assert.equal(billingState(camp("past_due", -1, "sub_1"), NOW).readOnly, true);
  assert.equal(billingState(camp("canceled", -1, "sub_1"), NOW).readOnly, true);
});

test("Stripe statuses collapse into the four CampFlow statuses", () => {
  assert.equal(mapStripeStatus("active"), "active");
  assert.equal(mapStripeStatus("trialing"), "trialing");
  assert.equal(mapStripeStatus("past_due"), "past_due");
  assert.equal(mapStripeStatus("unpaid"), "past_due");
  assert.equal(mapStripeStatus("incomplete"), "past_due");
  assert.equal(mapStripeStatus("paused"), "past_due");
  assert.equal(mapStripeStatus("canceled"), "canceled");
  assert.equal(mapStripeStatus("incomplete_expired"), "canceled");
});
