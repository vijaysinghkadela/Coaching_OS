# Database Schema Reference

Showcase mode uses mock data only.

## Mock Entities

The UI consumes the following in-memory shapes from `lib/demo/data.ts`:

- institutes
- profiles
- courses
- rooms
- batches
- students
- fee_structures
- fee_records
- payment_transactions
- attendance_sessions
- attendance_records
- tests
- test_scores
- staff
- whatsapp_messages
- saas_subscriptions
- ai_usage

## Notes

- There is no live Postgres schema in showcase mode.
- `lib/demo/client.ts` emulates the query patterns used by the app.
