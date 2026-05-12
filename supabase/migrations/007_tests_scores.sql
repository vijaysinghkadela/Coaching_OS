-- ============================================================================
-- Coaching OS — Migration 007: Tests & Scores
-- ============================================================================

CREATE TABLE IF NOT EXISTS tests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  batch_id     UUID REFERENCES batches(id) ON DELETE SET NULL,
  course_id    UUID REFERENCES courses(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  subject      TEXT NOT NULL,
  test_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  max_marks    DECIMAL(6,2) NOT NULL,
  passing_marks DECIMAL(6,2),
  test_type    TEXT NOT NULL DEFAULT 'unit'
    CHECK (test_type IN ('unit', 'chapter', 'mock', 'half_yearly', 'annual', 'jee_mock', 'neet_mock')),
  instructions TEXT,
  created_by   UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS test_scores (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id   UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  test_id        UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  student_id     UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  marks_obtained DECIMAL(6,2),
  is_absent      BOOLEAN NOT NULL DEFAULT false,
  rank_in_batch  INT,
  percentile     DECIMAL(5,2),
  notes          TEXT,
  entered_by     UUID REFERENCES teachers(id) ON DELETE SET NULL,
  entered_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(test_id, student_id)
);

CREATE OR REPLACE FUNCTION recompute_test_ranks(p_test_id UUID)
RETURNS VOID AS $$
BEGIN
  WITH ranked AS (
    SELECT id,
      RANK() OVER (ORDER BY marks_obtained DESC NULLS LAST) AS computed_rank,
      PERCENT_RANK() OVER (ORDER BY marks_obtained ASC NULLS LAST) * 100 AS computed_percentile
    FROM test_scores
    WHERE test_id = p_test_id AND is_absent = false
  )
  UPDATE test_scores ts
  SET
    rank_in_batch = r.computed_rank,
    percentile    = ROUND(r.computed_percentile::NUMERIC, 2)
  FROM ranked r
  WHERE ts.id = r.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE tests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY tests_owner   ON tests FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY tests_teacher ON tests FOR SELECT USING (is_teacher_at(institute_id));

CREATE POLICY scores_owner   ON test_scores FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY scores_teacher ON test_scores FOR ALL USING (is_teacher_at(institute_id));
CREATE POLICY scores_student ON test_scores
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_tests_institute   ON tests(institute_id, test_date DESC);
CREATE INDEX IF NOT EXISTS idx_tests_batch       ON tests(batch_id);
CREATE INDEX IF NOT EXISTS idx_scores_test       ON test_scores(test_id);
CREATE INDEX IF NOT EXISTS idx_scores_student    ON test_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_scores_institute  ON test_scores(institute_id);
CREATE OR REPLACE TRIGGER trg_updated_tests
  BEFORE UPDATE ON tests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_updated_scores
  BEFORE UPDATE ON test_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
