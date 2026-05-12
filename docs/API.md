# API Routes Reference

All API routes require the user to be authenticated via Supabase session cookie.

---

## Authentication

### `GET /api/auth/callback`
Supabase OAuth callback handler. Exchanges the auth code for a session and redirects to `/onboarding` or `/dashboard`.

---

## Attendance

### `POST /api/attendance/mark`
Bulk mark attendance for a session.

**Body:**
```json
{
  "batchId": "uuid",
  "sessionDate": "2025-06-15",
  "records": [
    { "studentId": "uuid", "status": "present" },
    { "studentId": "uuid", "status": "absent" }
  ]
}
```

**Response:** `{ "sessionId": "uuid", "count": 32 }`

**Side effects:** calls `trigger_absence_alerts(session_id)` to queue WhatsApp messages for students with 3+ consecutive absences.

---

### `POST /api/attendance/qr-generate`
Generate a QR session token for a batch.

**Body:** `{ "batchId": "uuid" }`

**Response:** `{ "token": "uuid", "expiresAt": "ISO timestamp" }`

---

### `GET /api/attendance/qr-verify?token=UUID`
Called when a student scans the QR code. Returns HTML page confirming attendance was marked.

---

## Fees

### `POST /api/fees/razorpay-order`
Create a Razorpay order for online fee payment.

**Body:** `{ "feeRecordId": "uuid", "amount": 5000 }`

**Response:** `{ "orderId": "order_xxx", "amount": 500000, "currency": "INR" }`

---

### `GET /api/fees/receipt/[id]`
Stream a PDF receipt for a payment transaction.

**Response:** PDF file with `Content-Disposition: attachment; filename="RCP-0001.pdf"`

---

## Communication

### `POST /api/communication/send`
Queue a WhatsApp broadcast message.

**Body:**
```json
{
  "batchId": "uuid | null",
  "audience": "students | parents | all",
  "message": "Your text here"
}
```

**Response:** `{ "count": 45 }` (number of messages queued)

---

## AI

### `POST /api/ai/parent-report`
Generate a Claude AI parent progress report for a student. **Pro plan only.**

**Body:** `{ "studentId": "uuid" }`

**Response:** `{ "report": "3-paragraph narrative text..." }`

Logs usage to `ai_usage` table with token counts.

---

### `POST /api/ai/study-plan`
Generate a Claude AI week-by-week study plan. **Pro plan only.**

**Body:**
```json
{
  "studentId": "uuid",
  "examDate": "2025-12-15",
  "focusAreas": "Weak in Organic Chemistry"
}
```

**Response:** `{ "plan": "Week 1: ... Week 2: ..." }`

---

## Webhooks

### `POST /api/webhooks/razorpay`
Handles Razorpay webhook events. Verifies HMAC-SHA256 signature.

Handled events:
- `subscription.activated` → sets `saas_subscriptions.status = 'active'`
- `subscription.cancelled` → sets status to `'cancelled'`
- `payment.captured` → updates fee record status

---

### `POST /api/webhooks/whatsapp`
Handles Meta WhatsApp delivery status updates. Updates `whatsapp_messages.status`.

Also handles the webhook verification `GET` request with verify token.

---

## Error Format

All API errors return:
```json
{ "error": "Human-readable error message" }
```

With appropriate HTTP status codes:
- `400` — validation error
- `401` — not authenticated
- `403` — plan tier restriction
- `404` — resource not found
- `500` — server error
