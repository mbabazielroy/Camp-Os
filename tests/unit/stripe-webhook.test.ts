// Unit tests for the Stripe webhook handler, run against Stripe event
// fixtures in tests/unit/fixtures/stripe. Signatures are produced with the
// Stripe SDK's own test helper, so verification runs exactly as in production.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Stripe from "stripe";
import {
  handleStripeWebhook,
  type BillingPatch,
  type CampBillingStore,
  type SubscriptionTarget,
} from "../../lib/stripe/webhook";

const SECRET = "whsec_test_campflow_unit";
const CAMP_ID = "11111111-2222-3333-4444-555555555555";
const stripe = new Stripe("sk_test_unit_not_a_real_key");

function fixture(name: string): string {
  return readFileSync(join(__dirname, "fixtures", "stripe", name), "utf8");
}

function sign(payload: string, secret = SECRET): string {
  return stripe.webhooks.generateTestHeaderString({ payload, secret });
}

type Call =
  | { kind: "byId"; campId: string; patch: BillingPatch }
  | { kind: "forSubscription"; target: SubscriptionTarget; patch: BillingPatch };

function recordingStore(rows = 1): CampBillingStore & { calls: Call[] } {
  const calls: Call[] = [];
  return {
    calls,
    async updateCampById(campId, patch) {
      calls.push({ kind: "byId", campId, patch });
      return rows;
    },
    async updateCampForSubscription(target, patch) {
      calls.push({ kind: "forSubscription", target, patch });
      return rows;
    },
  };
}

async function deliver(payload: string, signature: string | null, store = recordingStore()) {
  const result = await handleStripeWebhook({
    payload,
    signature,
    webhookSecret: SECRET,
    webhooks: stripe.webhooks,
    store,
  });
  return { result, store };
}

test("rejects a payload signed with the wrong secret", async () => {
  const payload = fixture("checkout.session.completed.json");
  const { result, store } = await deliver(payload, sign(payload, "whsec_someone_else"));
  assert.equal(result.status, 400);
  assert.equal(store.calls.length, 0);
});

test("rejects a payload that was changed after signing", async () => {
  const payload = fixture("customer.subscription.updated.json");
  const signature = sign(payload);
  const tampered = payload.replace('"status": "past_due"', '"status": "active"');
  assert.notEqual(tampered, payload);
  const { result, store } = await deliver(tampered, signature);
  assert.equal(result.status, 400);
  assert.equal(store.calls.length, 0);
});

test("rejects a request with no signature header", async () => {
  const { result, store } = await deliver(fixture("checkout.session.completed.json"), null);
  assert.equal(result.status, 400);
  assert.equal(store.calls.length, 0);
});

test("rejects a garbage signature header", async () => {
  const { result, store } = await deliver(fixture("checkout.session.completed.json"), "t=1,v1=abc");
  assert.equal(result.status, 400);
  assert.equal(store.calls.length, 0);
});

test("checkout.session.completed (paid) links the customer and activates the camp", async () => {
  const payload = fixture("checkout.session.completed.json");
  const { result, store } = await deliver(payload, sign(payload));
  assert.equal(result.status, 200);
  assert.deepEqual(store.calls, [
    {
      kind: "byId",
      campId: CAMP_ID,
      patch: {
        stripe_customer_id: "cus_TestCamp001",
        stripe_subscription_id: "sub_TestCamp001",
        subscription_status: "active",
      },
    },
  ]);
});

test("checkout.session.completed during a trial links ids but leaves the status alone", async () => {
  const payload = fixture("checkout.session.completed.trial.json");
  const { result, store } = await deliver(payload, sign(payload));
  assert.equal(result.status, 200);
  assert.deepEqual(store.calls, [
    {
      kind: "byId",
      campId: CAMP_ID,
      patch: {
        stripe_customer_id: "cus_TestCamp001",
        stripe_subscription_id: "sub_TestCamp001",
      },
    },
  ]);
});

test("customer.subscription.updated copies the new status to the camp", async () => {
  const payload = fixture("customer.subscription.updated.json");
  const { result, store } = await deliver(payload, sign(payload));
  assert.equal(result.status, 200);
  assert.deepEqual(store.calls, [
    {
      kind: "forSubscription",
      target: { campId: CAMP_ID, customerId: "cus_TestCamp001", subscriptionId: "sub_TestCamp001" },
      patch: {
        subscription_status: "past_due",
        stripe_customer_id: "cus_TestCamp001",
        stripe_subscription_id: "sub_TestCamp001",
      },
    },
  ]);
});

test("customer.subscription.deleted marks the camp canceled", async () => {
  const payload = fixture("customer.subscription.deleted.json");
  const { result, store } = await deliver(payload, sign(payload));
  assert.equal(result.status, 200);
  assert.equal(store.calls.length, 1);
  assert.equal(store.calls[0].kind, "forSubscription");
  assert.equal(store.calls[0].patch.subscription_status, "canceled");
});

test("other event types are acknowledged and ignored", async () => {
  const payload = fixture("invoice.paid.json");
  const { result, store } = await deliver(payload, sign(payload));
  assert.equal(result.status, 200);
  assert.match(result.message, /Ignored invoice\.paid/);
  assert.equal(store.calls.length, 0);
});

test("an event for an unknown camp is acknowledged without error", async () => {
  const payload = fixture("customer.subscription.updated.json");
  const { result } = await deliver(payload, sign(payload), recordingStore(0));
  assert.equal(result.status, 200);
  assert.match(result.message, /No matching camp/);
});

test("a database failure propagates so the route returns 500 and Stripe retries", async () => {
  const payload = fixture("checkout.session.completed.json");
  const failing: CampBillingStore = {
    async updateCampById() {
      throw new Error("db down");
    },
    async updateCampForSubscription() {
      throw new Error("db down");
    },
  };
  await assert.rejects(deliver(payload, sign(payload), failing as never), /db down/);
});
