-- ============================================================================
-- Coaching OS — Migration 008: Communication Log
-- ============================================================================

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  message_type    TEXT NOT NULL CHECK (message_type IN (
    'attendance_alert', 'fee_reminder', 'test_result', 'broadcast', 'welcome'
  )),
  recipient_phone TEXT NOT NULL,
  recipient_name  TEXT,
  student_id      UUID REFERENCES students(id) ON DELETE SET NULL,
  message_body    TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'read')),
  external_id     TEXT,
  sent_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  error_message   TEXT,
  triggered_by    UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY wa_owner ON whatsapp_messages
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY wa_teacher_read ON whatsapp_messages
  FOR SELECT USING (is_teacher_at(institute_id));

CREATE INDEX IF NOT EXISTS idx_wa_institute ON whatsapp_messages(institute_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_student   ON whatsapp_messages(student_id);
CREATE INDEX IF NOT EXISTS idx_wa_status    ON whatsapp_messages(institute_id, status);
