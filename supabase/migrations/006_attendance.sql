-- ============================================================================
-- Coaching OS — Migration 006: Attendance
-- ============================================================================

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  batch_id     UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  slot_id      UUID REFERENCES timetable_slots(id) ON DELETE SET NULL,
  teacher_id   UUID REFERENCES teachers(id) ON DELETE SET NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subject      TEXT,
  start_time   TIME,
  end_time     TIME,
  qr_token     TEXT UNIQUE,
  qr_expires_at TIMESTAMPTZ,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  session_id   UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'absent'
    CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by    TEXT NOT NULL DEFAULT 'teacher'
    CHECK (marked_by IN ('teacher', 'qr_scan', 'system')),
  marked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, student_id)
);

CREATE OR REPLACE VIEW student_attendance_summary AS
SELECT
  ar.student_id,
  s.institute_id,
  s.batch_id,
  COUNT(*) AS total_sessions,
  COUNT(*) FILTER (WHERE ar.status IN ('present','late')) AS attended,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE ar.status IN ('present','late'))
    / NULLIF(COUNT(*), 0), 2
  ) AS attendance_pct
FROM attendance_records ar
JOIN attendance_sessions asn ON ar.session_id = asn.id
JOIN students s ON ar.student_id = s.id
GROUP BY ar.student_id, s.institute_id, s.batch_id;

CREATE OR REPLACE FUNCTION get_consecutive_absences(p_student_id UUID)
RETURNS INT AS $$
DECLARE
  v_count INT := 0;
  v_row RECORD;
BEGIN
  FOR v_row IN
    SELECT ar.status
    FROM attendance_records ar
    JOIN attendance_sessions asn ON ar.session_id = asn.id
    WHERE ar.student_id = p_student_id
    ORDER BY asn.session_date DESC, asn.start_time DESC
    LIMIT 10
  LOOP
    EXIT WHEN v_row.status IN ('present', 'late', 'excused');
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records  ENABLE ROW LEVEL SECURITY;

CREATE POLICY att_sessions_owner ON attendance_sessions
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY att_sessions_teacher ON attendance_sessions
  FOR ALL USING (is_teacher_at(institute_id));
CREATE POLICY att_records_owner ON attendance_records
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY att_records_teacher ON attendance_records
  FOR ALL USING (is_teacher_at(institute_id));
CREATE POLICY att_records_student_self ON attendance_records
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_att_sessions_batch     ON attendance_sessions(batch_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_att_sessions_institute ON attendance_sessions(institute_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_att_records_session    ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_att_records_student    ON attendance_records(student_id);
