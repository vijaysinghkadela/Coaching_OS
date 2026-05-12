# Coaching OS

B2B SaaS dashboard for coaching and tuition institutes in Rajasthan. Replaces paper registers, Excel sheets, and manual WhatsApp broadcasts with a modern web dashboard.

Built by **Manglam Technical Agency (MTA)** 

---

## Features by Tier

| Feature | Starter ₹999/mo | Growth ₹1,999/mo | Pro ₹3,499/mo |
|---|:---:|:---:|:---:|
| Students (limit) | 100 | 300 | Unlimited |
| Batches | 5 | Unlimited | Unlimited |
| Attendance (manual) | ✓ | ✓ | ✓ |
| Fee management | ✓ | ✓ | ✓ |
| GST receipts | ✓ | ✓ | ✓ |
| Test score tracking | — | ✓ | ✓ |
| QR attendance | — | ✓ | ✓ |
| WhatsApp alerts | — | ✓ | ✓ |
| Staff management | — | — | ✓ |
| AI parent reports | — | — | ✓ |
| At-risk predictions | — | — | ✓ |
| AI study plans | — | — | ✓ |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| UI | shadcn/ui + Tailwind CSS v4 |
| Database + Auth | Supabase (PostgreSQL + RLS) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Payments | Razorpay (fee collection + SaaS subscriptions) |
| AI | Claude API (`claude-sonnet-4-6`) |
| WhatsApp | Meta WhatsApp Business API |
| Toasts | sonner |
| Theme | next-themes |

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd coaching-os
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from **Settings → API**

### 3. Run database migrations

Run each SQL file in the Supabase SQL editor in order:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_indexes.sql
supabase/migrations/004_triggers.sql
supabase/migrations/005_fee_management.sql
supabase/migrations/006_attendance.sql
supabase/migrations/007_tests_scores.sql
supabase/migrations/008_communication_log.sql
supabase/migrations/009_staff_management.sql
supabase/migrations/010_ai_usage.sql
supabase/migrations/011_subscriptions.sql
supabase/migrations/012_rpc_functions.sql
```

Or use the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx

WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id

# Server-only — never prefix with NEXT_PUBLIC_
ANTHROPIC_API_KEY=sk-ant-xxxxx

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000 and sign up to create your first institute.

---

## Project Structure

```
app/
├── (auth)/              # Login, signup
├── (dashboard)/         # Main app (auth-protected)
│   ├── dashboard/       # KPI overview
│   ├── students/        # Student enrollment and profiles
│   ├── batches/         # Batch management and timetable
│   ├── attendance/      # Manual and QR attendance
│   ├── fees/            # Fee structures, collection, receipts
│   ├── tests/           # Test management and rankings
│   ├── communication/   # WhatsApp broadcasts and history
│   ├── staff/           # Staff management (Pro only)
│   ├── ai/              # AI features (Pro only)
│   ├── settings/        # Institute profile, courses, rooms, billing
│   └── onboarding/      # First-run wizard
└── api/                 # API routes

components/
├── ui/                  # shadcn/ui components
├── layout/              # Sidebar, Topbar, TierGate
├── dashboard/           # KPI cards, charts, activity feed
├── students/            # Student table, enrollment form
├── batches/             # Timetable grid, slot dialog
├── attendance/          # Checklist, QR generator
├── fees/                # Payment dialog, receipt template
├── tests/               # Marks entry grid, rank table
├── ai/                  # Report generator, study plan
└── shared/              # Reusable: PageHeader, StatusBadge, etc.

lib/
├── supabase/            # Client, server, middleware helpers
├── actions/             # Server Actions (mutations)
├── validations/         # Zod schemas
├── constants.ts         # Tier limits, GST config
└── utils.ts             # cn(), formatCurrency(), calculateGST()

supabase/
├── migrations/          # 12 SQL migration files
└── functions/           # Deno Edge Functions (AI, WhatsApp)
```

---

## Database Functions

| Function | Description |
|---|---|
| `get_at_risk_students(institute_id)` | Students with attendance < 60% or avg score < 40% |
| `get_today_attendance_pct(institute_id)` | Today's overall attendance percentage |
| `trigger_absence_alerts(session_id)` | Queue WhatsApp alerts after 3 consecutive absences |
| `recompute_test_ranks(test_id)` | Recalculate batch ranks and percentiles after marks entry |

---

## Supabase Edge Functions

```bash
supabase functions deploy generate-ai-report
supabase functions deploy send-whatsapp

supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
supabase secrets set WHATSAPP_ACCESS_TOKEN=your-token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your-id
```

---

## Deployment (Vercel)

```bash
vercel --prod
```

In Supabase → Authentication → URL Configuration:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/api/auth/callback`

Razorpay webhook URL: `https://your-app.vercel.app/api/webhooks/razorpay`
Events to enable: `subscription.activated`, `subscription.cancelled`, `payment.captured`

---

## Multi-Tenancy & Security

- Every table has `institute_id` and Row Level Security (RLS) enabled
- All owner policies use `get_my_institute_id()` Postgres function
- Middleware enforces auth and tier-level route protection
- `ANTHROPIC_API_KEY` lives only in Supabase Edge Function secrets — never in Next.js env
- Student count limits enforced server-side before insert

---

## License

Proprietary — Manglam Technical Agency. All rights reserved.
# Coaching_OS
