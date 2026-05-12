-- ============================================================================
-- Coaching OS — Migration 010: AI Usage Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_usage (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  action          TEXT NOT NULL CHECK (action IN ('parent_report', 'study_plan', 'prediction')),
  student_id      UUID REFERENCES students(id) ON DELETE SET NULL,
  input_tokens    INT,
  output_tokens   INT,
  model           TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  result_preview  TEXT,
  cost_usd        DECIMAL(8,6),
  triggered_by    UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_usage_owner ON ai_usage
  FOR ALL USING (institute_id = get_my_institute_id());

CREATE INDEX IF NOT EXISTS idx_ai_usage_institute ON ai_usage(institute_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_action    ON ai_usage(institute_id, action);
