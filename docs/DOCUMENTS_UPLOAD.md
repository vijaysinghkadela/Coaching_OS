# Documents Upload — Step-by-step (MVP)

This doc records the end-to-end steps to implement the **core document upload feature**.

## Goal (what must work)
1. Client uploads multiple documents.
2. Each document is tagged with a category.
3. Coach can view + download documents (no edit/delete).
4. Coach can mark a document as **Verified** or **Pending**.
5. System tracks `uploaded_at`, `last_opened_by`, `last_opened_at`.
6. Uploading sensitive documents shows a consent popup.

---

## MVP Data Model (Supabase)
### 1) Metadata table
Create/confirm a table like:
- `student_documents` (recommended naming)

Expected columns:
- `id` (uuid)
- `institute_id` (uuid) — tenant isolation
- `student_id` (uuid)
- `coach_id` or derived via coach assignment (optional depending on existing schema)
- `category` (enum/text)
- `file_path` (text) — path inside Supabase Storage
- `file_name` (text)
- `file_size` (int or text)
- `status` (enum/text) => `verified` | `pending`
- `note` (text)
- `uploaded_at` (timestamptz)
- `uploaded_by` (uuid)
- `last_opened_by` (uuid nullable)
- `last_opened_at` (timestamptz nullable)

### 2) Storage bucket
Create/confirm a Supabase Storage bucket like:
- `student-documents` (recommended)

Recommended object key strategy:
- `{institute_id}/{student_id}/{document_id}/{file_name}`

---

## Security (RLS + bucket access)
### 1) RLS on metadata table
RLS rules must enforce:
- Only the assigned coach and the student can SELECT.
- Only the owner (client or admin) can INSERT.
- UPDATE permission:
  - Only coach can update `status`
  - Only client/admin can delete (but MVP can omit delete UI)

### 2) Storage policy
Use bucket policies to restrict file access to the same set of users.

---

## Upload Flow (UI → Storage → DB)
### Step 1: Upload dialog
- Inputs:
  - select student
  - select document category
  - select file (JPG/PNG/PDF/DOC/DOCX)
  - optional note
- Show consent popup when category is sensitive (Aadhaar, birth certificate, etc.)

### Step 2: Upload file to Supabase Storage
- Validate file type/size client-side.
- Generate storage path using tenant/student/document IDs.
- Upload via Supabase Storage SDK.

### Step 3: Insert metadata row
- After storage upload succeeds:
  - insert row into `student_documents` with `file_path`, `file_name`, `category`, etc.

### Step 4: UI refresh
- After insert, re-fetch documents list for the student/institute.

---

## Document List UI
### Step 1: Documents tab
- Render documents grouped or filterable by category.
- Show:
  - file icon
  - category label
  - status badge (Verified/Pending)
  - note
  - uploaded_at
  - last_opened_by/on

### Step 2: No edit/delete
- Remove any UI actions that mutate file content.

---

## Verify Toggle (coach)
### Step 1: UI toggle
- Coach clicks Verified/Pending.

### Step 2: Server action / API route
- Update metadata row: set `status` accordingly.

### Step 3: Audit (optional MVP)
- Optionally store `verified_by` + timestamp.

---

## Download / View Tracking (last opened)
### Step 1: Use a server route
Recommended:
- Next.js route `/documents/view/[id]`

### Step 2: On request
- Validate permissions (student/assigned coach/institute owner).
- Update `last_opened_by` and `last_opened_at`.
- Return a signed URL redirect (or stream).

### Step 3: Frontend
- “Download” button hits the view route.

---

## MVP Acceptance Checklist
- [ ] Upload works for JPG/PNG/PDF/DOC/DOCX
- [ ] Category is stored and filterable
- [ ] Coach sees only permitted documents
- [ ] Student sees only their documents
- [ ] Verify toggle updates status
- [ ] last opened tracking updates on download/view
- [ ] Consent popup appears for sensitive categories

