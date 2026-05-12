-- ============================================================================
-- Coaching OS — Migration 014: Scheduling and Calendar
-- ============================================================================

-- Create sessions table for individual coaching sessions
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  session_type    TEXT CHECK (session_type IN ('one_on_one', 'group', 'workshop', 'assessment', 'feedback')),
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time))/60) STORED,
  location        TEXT, -- can be room_id, online link, or address
  room_id         UUID REFERENCES rooms(id) ON DELETE SET NULL,
  status          TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled')),
  recurrence_rule TEXT, -- iCal recurrence rule for repeating sessions
  recurrence_id   UUID, -- links to original session if this is a recurrence
  agenda          JSONB DEFAULT '[]'::jsonb,
  objectives      JSONB DEFAULT '[]'::jsonb,
  materials_needed JSONB DEFAULT '[]'::jsonb,
  homework_assigned JSONB DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create session_attendance table for tracking attendance
CREATE TABLE IF NOT EXISTS session_attendance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id  UUID REFERENCES students(id) ON DELETE SET NULL,
  client_id   UUID REFERENCES client_profiles(id) ON DELETE SET NULL,
  attended    BOOLEAN DEFAULT false,
  join_time   TIMESTAMPTZ,
  leave_time  TIMESTAMPTZ,
  duration_minutes INTEGER,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create calendar_sync table for external calendar integrations
CREATE TABLE IF NOT EXISTS calendar_syncs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'apple', 'ical')),
  calendar_id     TEXT, -- external calendar ID
  sync_token      TEXT,
  last_sync_at    TIMESTAMPTZ,
  sync_direction  TEXT NOT NULL CHECK (sync_direction IN ('bidirectional', 'to_external', 'from_external')),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create session_reminders table
CREATE TABLE IF NOT EXISTS session_reminders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'sms', 'push', 'whatsapp')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at       TIMESTAMPTZ,
  status        TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  template_used TEXT,
  custom_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_institute ON sessions(institute_id);
CREATE INDEX IF NOT EXISTS idx_sessions_coach ON sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_sessions_client ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_recurrence ON sessions(recurrence_id);
CREATE INDEX IF NOT EXISTS idx_session_attendance_session ON session_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_session_attendance_student ON session_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_calendar_syncs_profile ON calendar_syncs(profile_id);
CREATE INDEX IF NOT EXISTS idx_session_reminders_session ON session_reminders(session_id);

-- Enable RLS on new tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies for sessions
CREATE POLICY sessions_owner_all ON sessions
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY sessions_coach_read ON sessions
  FOR SELECT USING (
    coach_id IN (SELECT id FROM coach_profiles WHERE profile_id = auth.uid())
  );
CREATE POLICY sessions_client_read ON sessions
  FOR SELECT USING (
    client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid())
  );
CREATE POLICY sessions_student_read ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = session_attendance.student_id
        AND session_attendance.session_id = sessions.id
        AND students.user_id = auth.uid()
    )
  );

-- RLS policies for session_attendance
CREATE POLICY session_attendance_owner_all ON session_attendance
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY session_attendance_self ON session_attendance
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) OR
    client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid())
  );

-- RLS policies for calendar_syncs
CREATE POLICY calendar_syncs_owner_all ON calendar_syncs
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY calendar_syncs_self ON calendar_syncs
  FOR SELECT USING (profile_id = auth.uid());

-- RLS policies for session_reminders
CREATE POLICY session_reminders_owner_all ON session_reminders
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY session_reminders_read ON session_reminders
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM sessions WHERE institute_id = get_my_institute_id()
    )
  );

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_session_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_calendar_syncs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_session_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER trg_updated_sessions
  BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_sessions_updated_at();

CREATE TRIGGER trg_updated_session_attendance
  BEFORE UPDATE ON session_attendance FOR EACH ROW EXECUTE FUNCTION update_session_attendance_updated_at();

CREATE TRIGGER trg_updated_calendar_syncs
  BEFORE UPDATE ON calendar_syncs FOR EACH ROW EXECUTE FUNCTION update_calendar_syncs_updated_at();

CREATE TRIGGER trg_updated_session_reminders
  BEFORE UPDATE ON session_reminders FOR EACH ROW EXECUTE FUNCTION update_session_reminders_updated_at();

-- Add comments
COMMENT ON TABLE sessions IS 'Individual coaching sessions between coaches and clients';
COMMENT ON COLUMN sessions.session_type IS 'Type of coaching session';
COMMENT ON COLUMN sessions.status IS 'Current status of the session';
COMMENT ON COLUMN sessions.recurrence_rule IS 'iCal format recurrence rule for repeating sessions';
COMMENT ON COLUMN sessions.agenda IS 'JSON array of agenda items for the session';
COMMENT ON COLUMN sessions.objectives IS 'JSON array of learning objectives';
COMMENT ON COLUMN sessions.materials_needed IS 'JSON array of materials required for session';
COMMENT ON COLUMN sessions.homework_assigned IS 'JSON array of homework assigned';
COMMENT ON TABLE session_attendance IS 'Tracking attendance for sessions';
COMMENT ON TABLE calendar_syncs IS 'External calendar synchronization settings';
COMMENT ON TABLE session_reminders IS 'Reminders sent for upcoming sessions';