-- ============================================================================
-- Coaching OS — Migration 001: Initial Schema
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL,
  phone       TEXT,
  avatar_url  TEXT,
  global_role TEXT NOT NULL DEFAULT 'owner'
    CHECK (global_role IN ('super_admin', 'owner', 'teacher', 'student')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, global_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'global_role', 'owner')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── INSTITUTES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS institutes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES profiles(id),
  name            TEXT NOT NULL,
  address         TEXT,
  city            TEXT NOT NULL DEFAULT 'Bikaner',
  state           TEXT NOT NULL DEFAULT 'Rajasthan',
  phone           TEXT,
  email           TEXT,
  gstin           TEXT,
  logo_url        TEXT,
  plan_tier       TEXT NOT NULL DEFAULT 'starter'
    CHECK (plan_tier IN ('starter', 'growth', 'pro')),
  max_students    INT NOT NULL DEFAULT 100,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── INSTITUTE MEMBERS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS institute_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role         TEXT NOT NULL CHECK (role IN ('owner', 'teacher', 'student')),
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institute_id, user_id)
);

-- ─── COURSES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  code         TEXT,
  description  TEXT,
  subjects     TEXT[] NOT NULL DEFAULT '{}',
  duration_months INT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institute_id, name)
);

-- ─── ROOMS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  capacity     INT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── TEACHERS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT NOT NULL,
  subjects        TEXT[] NOT NULL DEFAULT '{}',
  photo_url       TEXT,
  designation     TEXT,
  date_of_joining DATE,
  salary          DECIMAL(10,2),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── BATCHES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  name         TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2025-26',
  start_date   DATE,
  end_date     DATE,
  max_students INT NOT NULL DEFAULT 60,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institute_id, name, academic_year)
);

-- ─── TIMETABLE SLOTS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timetable_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id     UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  day_of_week  INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  subject      TEXT NOT NULL,
  teacher_id   UUID REFERENCES teachers(id) ON DELETE SET NULL,
  room_id      UUID REFERENCES rooms(id) ON DELETE SET NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── STUDENTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  batch_id        UUID REFERENCES batches(id) ON DELETE SET NULL,
  course_id       UUID REFERENCES courses(id) ON DELETE SET NULL,
  full_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT NOT NULL,
  parent_phone    TEXT NOT NULL,
  parent_name     TEXT,
  date_of_birth   DATE,
  gender          TEXT CHECK (gender IN ('male', 'female', 'other')),
  photo_url       TEXT,
  address         TEXT,
  city            TEXT,
  aadhar_number   TEXT,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  enrollment_no   TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS enrollment_number_seq START WITH 1001;

CREATE OR REPLACE FUNCTION generate_enrollment_no()
RETURNS TRIGGER AS $$
BEGIN
  NEW.enrollment_no := 'COS-' || TO_CHAR(now(), 'YY') || '-' ||
    LPAD(nextval('enrollment_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER auto_enrollment_no
  BEFORE INSERT ON students
  FOR EACH ROW
  WHEN (NEW.enrollment_no IS NULL OR NEW.enrollment_no = '')
  EXECUTE FUNCTION generate_enrollment_no();

-- ─── STUDENT DOCUMENTS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  doc_type     TEXT NOT NULL CHECK (doc_type IN ('photo', 'aadhar', 'marksheet', 'transfer_cert', 'other')),
  file_name    TEXT NOT NULL,
  file_url     TEXT NOT NULL,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
