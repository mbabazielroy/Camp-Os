import Link from "next/link";
import { requireCamp, getCampBilling } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/env";
import { startCheckout, openBillingPortal } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { SubscriptionStatus } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<SubscriptionStatus, { label: string; className: string }> = {
  trialing: { label: "Free trial", className: "bg-primary-soft text-primary" },
  active: { label: "Active", className: "bg-primary-soft text-primary" },
  past_due: { label: "Payment overdue", className: "bg-warning-soft text-warning" },
  canceled: { label: "Canceled", className: "bg-danger-soft text-danger" },
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; checkout?: string; locked?: string }>;
}) {
  const { error, checkout, locked } = await searchParams;
  const { supabase, campId, role } = await requireCamp();

  const header = (
    <PageHeader title="Billing" description="Your CampFlow plan: CA$79/month per camp." />
  );
  const back = (
    <p className="mt-4 text-sm">
      <Link href="/settings" className="text-primary hover:underline">
        Back to settings
      </Link>
    </p>
  );

  if (role !== "director") {
    return (
      <div>
        {header}
        <Card className="p-4">
          <p className="text-sm text-foreground">Only directors can manage billing.</p>
        </Card>
        {back}
      </div>
    );
  }

  const billing = isStripeConfigured() ? await getCampBilling(supabase, campId) : null;

  if (!billing) {
    return (
      <div>
        {header}
        <Card className="p-4">
          <p className="text-sm font-medium text-foreground">Billing not configured</p>
          <p className="text-xs text-muted mt-1">
            Set STRIPE_SECRET_KEY, STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET and
            SUPABASE_SERVICE_ROLE_KEY to turn on subscriptions. Until then nothing is
            limited.
          </p>
        </Card>
        {back}
      </div>
    );
  }

  const status = STATUS_LABELS[billing.status];
  const canSubscribe = billing.status !== "active" && !billing.hasSubscription;

  return (
    <div>
      {header}

      {error && (
        <p className="mb-4 rounded-lg bg-danger-soft text-danger text-sm px-3 py-2">{error}</p>
      )}
      {checkout === "success" && (
        <p className="mb-4 rounded-lg bg-primary-soft text-primary text-sm px-3 py-2">
          Thanks! Your subscription is being set up. It can take a minute to show here.
        </p>
      )}
      {(locked || billing.readOnly) && (
        <p className="mb-4 rounded-lg bg-warning-soft text-warning text-sm px-3 py-2">
          Your free trial has ended, so CampFlow is read-only. Your data is safe; subscribe
          to keep making changes.
        </p>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">Status</p>
          <Badge className={status.className}>{status.label}</Badge>
        </div>
        {billing.status === "trialing" && (
          <p className="text-sm text-muted mt-2">
            {billing.trialEnded
              ? "Your free trial has ended."
              : `${billing.trialDaysLeft} ${billing.trialDaysLeft === 1 ? "day" : "days"} left in your free trial (ends ${billing.trialEndsAt.toLocaleDateString("en-CA", { dateStyle: "medium" })}).`}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {canSubscribe && (
            <form action={startCheckout}>
              <SubmitButton pendingText="Opening checkout...">Subscribe</SubmitButton>
            </form>
          )}
          {billing.hasCustomer && (
            <form action={openBillingPortal}>
              <SubmitButton pendingText="Opening..." variant="secondary">
                Manage billing
              </SubmitButton>
            </form>
          )}
        </div>
      </Card>
      {back}
    </div>
  );
}
