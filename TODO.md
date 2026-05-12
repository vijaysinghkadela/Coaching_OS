# Coaching OS — Implementation TODO

## Phase 1: Repo inspection (docs + documents + subscription)

- [ ] Inspect Supabase migrations for documents/upload/storage-related schema.
- [ ] Inspect code for any existing document upload/download routes and storage client usage.
- [ ] Locate all subscription references (UI pages, webhook handling, tier gating, demo mocks).

## Phase 2: Documentation updates

- [ ] Update `README.md`:
  - [ ] Add “Feature Types” and “MVP Features” sections (from user task).
  - [ ] Remove subscription/in-app subscription pricing/setup references.
- [ ] Create `docs/FEATURES.md` (master feature list + MVP list).
- [ ] Create `docs/DOCUMENTS_UPLOAD.md` (end-to-end steps).
- [x] Create `docs/SUBSCRIPTIONS_REMOVAL.md` (what removed + what remains).
- [x] Create `docs/QUALITY_CHECKS.md` (lint/build results).

## Phase 3: Implement working documents upload + visibility

- [ ] Replace demo-only documents usage in documents UI and student profile with DB-backed fetch.
- [ ] Implement document upload (file → Supabase Storage → metadata row).
- [ ] Implement verify/pending toggle.
- [ ] Implement last-opened tracking on download/view.
- [ ] Ensure RLS policies enforce: client + assigned coach can read; others cannot.

## Phase 4: Remove subscription flows

- [ ] Remove SaaS subscription UI (billing settings page).
- [ ] Remove/disable Razorpay subscription logic in webhook.
- [ ] Remove `saas_subscriptions` table/policies via a new migration (or disable if removal is risky).
- [ ] Remove subscription demo mocks.

## Phase 5: Fix warnings/issues and validate


- [ ] Run `npm run lint` and fix all warnings/errors.
- [ ] Run `npm run build` and fix build errors.
- [ ] Smoke test documents upload, listing, verification, download permissions.

## Done Criteria

- [ ] Documents upload works end-to-end (upload → list → verify toggle → download).
- [ ] Subscription UI and flows are fully removed/disabled.
- [ ] README + all docs (.md) are updated with step-by-step logs.
- [ ] Lint/build have no blocking issues.
