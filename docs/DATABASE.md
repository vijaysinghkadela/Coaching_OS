# Database Schema Reference

Coaching OS uses Supabase (PostgreSQL) with Row Level Security on every table.

## Multi-Tenancy Pattern

```sql
-- All RLS policies use this function to isolate institute data
CREATE OR REPLACE FUNCTION get_my_institute_id() RETURNS UUID AS $$
  SELECT id FROM institutes WHERE owner_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## Core Tables

### `institutes` (root tenant)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `owner_id` | uuid FK → auth.users | institute owner |
| `name` | text | |
| `city` | text | |
| `gstin` | text | GST registration number |
| `plan_tier` | enum | `starter`, `growth`, `pro` |
| `max_students` | int | tier limit |
| `logo_url` | text | Supabase Storage URL |

### `courses`
Defines courses offered (JEE Mains, NEET, 10th Class Maths, etc.)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `institute_id` | uuid FK | |
| `name` | text | |
| `subjects` | text[] | e.g. `{Physics, Chemistry, Maths}` |
| `duration_months` | int | |
| `is_active` | bool | |

### `rooms`
Classrooms and labs.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `institute_id` | uuid FK | |
| `name` | text | e.g. "Room A", "Lab 1" |
| `capacity` | int | max students |
| `is_active` | bool | |

### `teachers`
Teaching staff with subject expertise (linked from `staff`).

### `batches`
Student batch groups.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `institute_id` | uuid FK | |
| `course_id` | uuid FK | |
| `name` | text | e.g. "JEE 2026 Morning" |
| `academic_year` | text | e.g. "2025-26" |
| `capacity` | int | |
| `status` | enum | `active`, `completed`, `cancelled` |

### `timetable_slots`
Weekly schedule with conflict detection.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `batch_id` | uuid FK | |
| `teacher_id` | uuid FK nullable | |
| `room_id` | uuid FK nullable | |
| `subject` | text | |
| `day_of_week` | int | 0=Sun, 1=Mon … 6=Sat |
| `start_time` | time | |
| `end_time` | time | |

**Conflict constraints:**
```sql
UNIQUE NULLS NOT DISTINCT (teacher_id, day_of_week, start_time)  -- no teacher double-booking
UNIQUE NULLS NOT DISTINCT (room_id, day_of_week, start_time)     -- no room double-booking
```

---

## Student Tables

### `students`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `institute_id` | uuid FK | |
| `batch_id` | uuid FK nullable | |
| `course_id` | uuid FK nullable | |
| `enrollment_no` | text UNIQUE | auto-generated `INST-0001` pattern |
| `full_name` | text | |
| `phone` | text | |
| `parent_phone` | text | |
| `parent_name` | text | |
| `email` | text | |
| `gender` | enum | `male`, `female`, `other` |
| `date_of_birth` | date | |
| `admission_date` | date | |
| `aadhar_number` | text | encrypted at rest |
| `status` | enum | `active`, `inactive`, `graduated` |

### `student_documents`
Supabase Storage references for Aadhar, photos, marksheets.

---

## Fee Tables

### `fee_structures`
Template for fee configuration.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `institute_id` | uuid FK | |
| `course_id` | uuid FK nullable | |
| `name` | text | e.g. "Annual Fee 2025-26" |
| `total_amount` | numeric | base pre-tax amount |
| `base_amount` | numeric | same as total_amount |
| `gst_amount` | numeric | CGST + SGST total |
| `gst_rate` | numeric | percentage (0, 5, 12, 18) |
| `installments` | int | 1 = one-time |

### `fee_records`
Per-student fee ledger.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `student_id` | uuid FK | |
| `institute_id` | uuid FK | |
| `fee_structure_id` | uuid FK | |
| `total_amount` | numeric | |
| `amount_paid` | numeric | updated by trigger on payment |
| `due_date` | date | |
| `status` | enum | `pending`, `partial`, `paid`, `overdue` |

### `payment_transactions`
Individual payments with GST receipt.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `fee_record_id` | uuid FK | |
| `institute_id` | uuid FK | |
| `amount` | numeric | amount collected |
| `payment_method` | enum | `cash`, `upi`, `bank_transfer`, `razorpay`, `cheque` |
| `payment_date` | timestamptz | |
| `receipt_number` | text | auto-generated sequence `RCP-0001` |
| `status` | enum | `completed`, `failed`, `refunded` |

**Trigger:** after each payment, updates `fee_records.amount_paid` and `status`.

---

## Attendance Tables

### `attendance_sessions`
One session = one batch on one date.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `institute_id` | uuid FK | |
| `batch_id` | uuid FK | |
| `session_date` | date | |
| `qr_token` | uuid | for QR self-marking |
| `qr_expires_at` | timestamptz | 30-min expiry |

**Unique constraint:** `(batch_id, session_date)` — one session per batch per day.

### `attendance_records`
Per-student status per session.

| Column | Type | Notes |
|---|---|---|
| `student_id` | uuid FK | |
| `session_id` | uuid FK | |
| `status` | enum | `present`, `absent`, `late`, `excused` |

**Unique constraint:** `(student_id, session_id)`

---

## Test Tables

### `tests`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `institute_id` | uuid FK | |
| `batch_id` | uuid FK | |
| `name` | text | |
| `test_type` | enum | `unit`, `mock`, `half_yearly`, `annual`, `weekly` |
| `test_date` | date | |
| `max_marks` | int | |
| `subjects` | text[] | |

### `test_scores`
| Column | Type | Notes |
|---|---|---|
| `test_id` | uuid FK | |
| `student_id` | uuid FK | |
| `marks_obtained` | numeric | |
| `max_marks` | int | |
| `rank_in_batch` | int | computed by `recompute_test_ranks()` |
| `percentile` | numeric | computed |
| `is_absent` | bool | |

---

## Communication

### `whatsapp_messages`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `institute_id` | uuid FK | |
| `student_id` | uuid FK nullable | null = broadcast |
| `message_type` | enum | `attendance_alert`, `fee_reminder`, `test_result`, `broadcast` |
| `content` | text | |
| `to_number` | text | |
| `status` | enum | `queued`, `sent`, `delivered`, `failed` |
| `wa_message_id` | text | WhatsApp API message ID |

---

## Staff Tables (Pro only)

### `staff`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `institute_id` | uuid FK | |
| `full_name` | text | |
| `role` | enum | `teacher`, `admin`, `receptionist`, `accountant`, `support` |
| `phone` | text | |
| `email` | text | |
| `salary_type` | enum | `monthly`, `hourly`, `per_session` |
| `base_salary` | numeric | |
| `joining_date` | date | |
| `status` | enum | `active`, `inactive`, `terminated` |

### `staff_attendance`, `leave_requests`, `payroll_records`
Staff-specific HR tables defined in `009_staff_management.sql`.

---

## SaaS Subscriptions

### `saas_subscriptions`
| Column | Type | Notes |
|---|---|---|
| `institute_id` | uuid PK/FK | one per institute |
| `plan_tier` | enum | `starter`, `growth`, `pro` |
| `status` | enum | `trial`, `active`, `past_due`, `cancelled` |
| `razorpay_subscription_id` | text | |
| `current_period_end` | timestamptz | |

---

## AI Usage Logging

### `ai_usage`
| Column | Type | Notes |
|---|---|---|
| `institute_id` | uuid FK | |
| `feature` | text | `parent_report`, `study_plan` |
| `student_id` | uuid FK nullable | |
| `input_tokens` | int | Claude input tokens |
| `output_tokens` | int | Claude output tokens |
| `cost_usd` | numeric | calculated cost |
