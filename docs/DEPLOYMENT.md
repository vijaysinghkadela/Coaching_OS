# Deployment Guide

## Purpose

This repository is showcase-only. It runs entirely on local demo data and does not require Supabase, Razorpay, WhatsApp, or Anthropic credentials to build or preview.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment

Only these values are needed:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_DEMO_MODE` | `true` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

## Notes

- `docs/DATABASE.md` documents the mock data shapes.
- `docs/API.md` documents the route behavior in demo mode.
- `docs/PROJECT_MAP.md` documents the repo structure.
