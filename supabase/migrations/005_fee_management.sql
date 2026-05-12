-- ============================================================================
-- Coaching OS — Migration 005: Fee Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS fee_structures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  total_amount    DECIMAL(10,2) NOT NULL,
  installments    INT NOT NULL DEFAULT 1,
  gst_rate        DECIMAL(5,2) NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fee_records (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id       UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  student_id         UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id   UUID REFERENCES fee_structures(id) ON DELETE SET NULL,
  total_amount       DECIMAL(10,2) NOT NULL,
  amount_paid        DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount           DECIMAL(10,2) NOT NULL DEFAULT 0,
  due_date           DATE,
  status             TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'waived')),
  academic_year      TEXT NOT NULL DEFAULT '2025-26',
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS receipt_number_seq START WITH 1;

CREATE TABLE IF NOT EXISTS payment_transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id        UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  fee_record_id       UUID NOT NULL REFERENCES fee_records(id) ON DELETE RESTRICT,
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  amount              DECIMAL(10,2) NOT NULL,
  payment_mode        TEXT NOT NULL CHECK (payment_mode IN ('cash', 'upi', 'razorpay', 'cheque', 'neft')),
  payment_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_no        TEXT,
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  status              TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  receipt_number      TEXT UNIQUE,
  gst_amount          DECIMAL(10,2) NOT NULL DEFAULT 0,
  cgst                DECIMAL(10,2) NOT NULL DEFAULT 0,
  sgst                DECIMAL(10,2) NOT NULL DEFAULT 0,
  collected_by        UUID REFERENCES profiles(id),
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.receipt_number := 'COS-' || TO_CHAR(now(), 'YYYY') || '-' ||
    LPAD(nextval('receipt_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER auto_receipt_number
  BEFORE INSERT ON payment_transactions
  FOR EACH ROW
  WHEN (NEW.receipt_number IS NULL)
  EXECUTE FUNCTION generate_receipt_number();

CREATE OR REPLACE FUNCTION update_fee_record_after_payment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE fee_records
  SET
    amount_paid = amount_paid + NEW.amount,
    status = CASE
      WHEN (amount_paid + NEW.amount) >= (total_amount - discount) THEN 'paid'
      WHEN (amount_paid + NEW.amount) > 0 THEN 'partial'
      ELSE 'pending'
    END,
    updated_at = now()
  WHERE id = NEW.fee_record_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_fee_record
  AFTER INSERT ON payment_transactions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_fee_record_after_payment();

ALTER TABLE fee_structures       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_records          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY fee_structures_owner ON fee_structures
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY fee_structures_teacher_read ON fee_structures
  FOR SELECT USING (is_teacher_at(institute_id));

CREATE POLICY fee_records_owner ON fee_records
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY fee_records_teacher_read ON fee_records
  FOR SELECT USING (is_teacher_at(institute_id));

CREATE POLICY payment_tx_owner ON payment_transactions
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY payment_tx_teacher_read ON payment_transactions
  FOR SELECT USING (is_teacher_at(institute_id));

CREATE INDEX IF NOT EXISTS idx_fee_records_institute  ON fee_records(institute_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_student    ON fee_records(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_status     ON fee_records(institute_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_tx_institute   ON payment_transactions(institute_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_student     ON payment_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_date        ON payment_transactions(institute_id, payment_date DESC);
CREATE OR REPLACE TRIGGER trg_updated_fee_structures
  BEFORE UPDATE ON fee_structures FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_updated_fee_records
  BEFORE UPDATE ON fee_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
