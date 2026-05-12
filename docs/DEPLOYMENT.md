# Deployment Guide

## Prerequisites

- Supabase project (database + auth)
- Vercel account (hosting)
- Razorpay account (payments)
- Meta WhatsApp Business API (messaging)
- Anthropic API key (AI features)

---

## Step 1 — Supabase Setup

### Create project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. New Project → enter name and database password
3. Note your **Project URL** and **anon public key** (Settings → API)
4. Note your **Service Role Key** (Settings → API → keep secret)

### Run migrations

In Supabase SQL Editor, run each migration file from `supabase/migrations/` in order (001 through 012).

### Configure Auth

Settings → Authentication → URL Configuration:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/api/auth/callback`

### Deploy Edge Functions

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF

supabase functions deploy generate-ai-report
supabase functions deploy send-whatsapp

supabase secrets set ANTHROPIC_API_KEY=sk-ant-YOUR_KEY
supabase secrets set WHATSAPP_ACCESS_TOKEN=YOUR_TOKEN
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_ID
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

---

## Step 2 — Razorpay Setup

### Test mode (development)
1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Toggle to **Test Mode**
3. Settings → API Keys → Generate Key
4. Note `Key ID` and `Key Secret`

### Create subscription plans
In Razorpay Dashboard → Subscriptions → Plans, create three plans:
- Starter: ₹999/month
- Growth: ₹1,999/month
- Pro: ₹3,499/month

### Configure webhook
Settings → Webhooks → Add New Webhook:
- URL: `https://your-app.vercel.app/api/webhooks/razorpay`
- Events: `subscription.activated`, `subscription.cancelled`, `payment.captured`
- Note the **webhook secret** for `RAZORPAY_KEY_SECRET`

### Go live
When ready: switch to Live Mode, generate live API keys, update env vars.

---

## Step 3 — WhatsApp Business API Setup

### Meta Developer Account
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create App → Business → Add WhatsApp product
3. WhatsApp → Getting Started → note **Phone Number ID** and **Access Token**

### Message Templates
Create these templates in WhatsApp Manager → Message Templates:

**`attendance_alert`** (Utility):
```
Dear parent, your child {{1}} has been absent for 3 consecutive classes.
Please contact {{2}} at {{3}} for more information.
```

**`fee_reminder`** (Utility):
```
Dear {{1}}, your fee of ₹{{2}} for {{3}} is due on {{4}}.
Please contact us at {{5}} to pay.
```

**`test_result`** (Utility):
```
{{1}} scored {{2}}/{{3}} ({{4}}%) in {{5}}.
Rank: {{6}} in batch. — {{7}}
```

Wait for template approval (usually 24–48 hours).

### Webhook (for delivery status)
Configure webhook in Meta Developer Console:
- URL: `https://your-app.vercel.app/api/webhooks/whatsapp`
- Verify Token: any secret string — add as `WHATSAPP_VERIFY_TOKEN` env var
- Subscribe to: `messages`

---

## Step 4 — Vercel Deployment

### Deploy

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add all from `.env.local.example`:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `RAZORPAY_KEY_ID` | Razorpay live key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` |
| `WHATSAPP_API_URL` | `https://graph.facebook.com/v18.0` |
| `WHATSAPP_ACCESS_TOKEN` | Meta permanent access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta phone number ID |
| `ANTHROPIC_API_KEY` | Claude API key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

---

## Step 5 — First Run Verification

1. Open `https://your-app.vercel.app`
2. Sign up with a new institute
3. Complete the 4-step onboarding wizard
4. Add a course and batch
5. Enroll a test student
6. Mark attendance → verify no console errors
7. Record a fee payment → download the receipt
8. If on Pro: generate an AI parent report

---

## Monitoring

### Supabase
- Database health: Supabase Dashboard → Reports
- Edge Function logs: Supabase Dashboard → Edge Functions → Logs
- Auth events: Supabase Dashboard → Authentication → Logs

### Vercel
- Build and runtime logs: Vercel Dashboard → Deployments → Function Logs
- Error monitoring: add Sentry via `@sentry/nextjs` if needed

---

## Common Issues

### "Invalid JWT" errors
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` match the project
- Ensure the auth callback URL is registered in Supabase

### WhatsApp messages not sending
- Verify the phone number is verified in Meta Business Manager
- Check message templates are approved (not just submitted)
- Confirm `WHATSAPP_PHONE_NUMBER_ID` is the numeric ID, not the phone number

### Razorpay webhook failures
- The webhook signature uses `RAZORPAY_KEY_SECRET` — confirm it matches Razorpay dashboard
- Check Vercel function logs for the raw error

### RPC functions not found
- Ensure migration `012_rpc_functions.sql` has been executed in Supabase
- Run in Supabase SQL Editor: `SELECT * FROM pg_proc WHERE proname = 'get_at_risk_students';`
