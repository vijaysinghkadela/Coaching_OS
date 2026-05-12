# Subscriptions Removal — Step-by-step

This doc captures the required removal of **in-app / SaaS subscriptions** from the MVP.

## Current state (before changes)
- `saas_subscriptions` table exists in Supabase migrations.
- UI: `app/(dashboard)/settings/billing/page.tsx` uses `saas_subscriptions` and shows plan tiers + manage subscription.
- Webhook: `app/api/webhooks/razorpay/route.ts` updates subscription rows and downgrades institutes.
- Middleware enforces Pro-only routes, and redirects `/settings/billing` for Pro gating.

## Removal target
- No subscription purchase/management UX.
- No subscription status lookups in UI.
- Webhooks should no longer handle subscription events for MVP.
- Middleware redirect away from `/settings/billing` should be adjusted so it does not depend on subscription rows.

---

## Step 1: Remove/disable billing page
- Edit `app/(dashboard)/settings/billing/page.tsx`
  - Replace with an informational page like “Billing disabled in MVP” OR redirect to settings home.
  - Remove all `saas_subscriptions` queries and Razorpay links.

---

## Step 2: Disable subscription branches in Razorpay webhook
- Edit `app/api/webhooks/razorpay/route.ts`
  - Remove handling for:
    - `subscription.activated`
    - `subscription.charged`
    - `subscription.cancelled`
    - `subscription.expired`
  - Keep handling for `payment.captured` only if payments are still required for fees.
  - If fee payments are also not needed in MVP, disable all Razorpay webhook actions.

---

## Step 3: Remove saas_subscriptions table usage
Two safe options:

### Option A (recommended): Keep table, remove code dependency
- Keep `saas_subscriptions` table/migration as-is.
- Ensure no app UI/webhooks read/write it.
- Remove any demo mocks that include subscription objects.

### Option B: Drop table + RLS via new migration
- Create a follow-up SQL migration that:
  - disables RLS
  - drops the `saas_subscriptions` table
  - drops associated policies/indexes

Choose **Option A** if you want minimal risk to existing schema. Choose **Option B** for full cleanup.

---

## Step 4: Update middleware / tier gating
- Edit `middleware.ts`
  - If Pro-only pages exist, keep `TierGate` logic.
  - But remove redirect behavior to `/settings/billing` that implies subscription purchase.
  - Instead redirect to `/staff` or a generic “Upgrade disabled” page.

---

## Step 5: Update README + docs
- Remove subscription pricing/tiers and Razorpay subscription setup steps.
- Add a note stating subscription is disabled for MVP.

---

## Acceptance checklist
- [ ] Billing settings page no longer references `saas_subscriptions`.
- [ ] Webhook no longer processes subscription.* events.
- [ ] No UI or code path calls Razorpay subscription management.
- [ ] app compiles and passes lint/build.

