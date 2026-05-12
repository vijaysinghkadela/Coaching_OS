-- ============================================================================
-- Coaching OS — Migration 009: Staff Management (Pro Tier)
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id      UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  teacher_id        UUID REFERENCES teachers(id) ON DELETE SET NULL,
  full_name         TEXT NOT NULL,
  role              TEXT NOT NULL,
  phone             TEXT NOT NULL,
  email             TEXT,
  date_of_joining   DATE,
  basic_salary      DECIMAL(10,2) NOT NULL DEFAULT 0,
  hra               DECIMAL(10,2) NOT NULL DEFAULT 0,
  allowances        DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff_attendance (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  staff_id     UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  status       TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half_day', 'on_leave')),
  check_in     TIME,
  check_out    TIME,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, date)
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id  UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  staff_id      UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  from_date     DATE NOT NULL,
  to_date       DATE NOT NULL,
  leave_type    TEXT NOT NULL CHECK (leave_type IN ('casual', 'sick', 'earned', 'unpaid')),
  reason        TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by   UUID REFERENCES profiles(id),
  approved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payroll_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  staff_id        UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  month           INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year            INT NOT NULL,
  basic_salary    DECIMAL(10,2) NOT NULL,
  hra             DECIMAL(10,2) NOT NULL DEFAULT 0,
  allowances      DECIMAL(10,2) NOT NULL DEFAULT 0,
  deductions      DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_salary      DECIMAL(10,2) NOT NULL,
  days_present    INT,
  days_absent     INT,
  status          TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'paid', 'cancelled')),
  paid_at         TIMESTAMPTZ,
  payment_mode    TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, month, year)
);

ALTER TABLE staff            ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records  ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_owner       ON staff            FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY staff_att_owner   ON staff_attendance FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY leave_owner       ON leave_requests   FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY payroll_owner     ON payroll_records  FOR ALL USING (institute_id = get_my_institute_id());

CREATE INDEX IF NOT EXISTS idx_staff_institute     ON staff(institute_id);
CREATE INDEX IF NOT EXISTS idx_staff_att_staff     ON staff_attendance(staff_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_leave_staff         ON leave_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_payroll_staff       ON payroll_records(staff_id, year, month);
CREATE OR REPLACE TRIGGER trg_updated_staff
  BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at();
