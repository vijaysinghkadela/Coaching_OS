-- ============================================================================
-- Coaching OS — Migration 016: Session and Program Management
-- ============================================================================

-- Create coaching_programs table for structured coaching programs/plans
CREATE TABLE IF NOT EXISTS coaching_programs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT CHECK (category IN ('academic', 'skill_development', 'test_prep', 'language', 'life_career', 'holistic')),
  level           TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  duration_weeks  INTEGER,
  sessions_per_week INTEGER DEFAULT 2,
  start_date      DATE,
  end_date        DATE,
  max_participants INTEGER DEFAULT 20,
  current_participants INTEGER DEFAULT 0,
  price           DECIMAL(10,2),
  currency        TEXT DEFAULT 'INR',
  status          TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
  curriculum      JSONB DEFAULT '[]'::jsonb, -- structured weekly plan
  prerequisites   JSONB DEFAULT '[]'::jsonb,
  learning_outcomes JSONB DEFAULT '[]'::jsonb,
  materials_included JSONB DEFAULT '[]'::jsonb,
  assessment_method JSONB DEFAULT '{}'::jsonb,
  certificate_offered BOOLEAN DEFAULT false,
  tags            TEXT[] DEFAULT '{}',
  is_featured     BOOLEAN DEFAULT false,
  thumbnail_url   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create program_enrollments table for tracking who's enrolled in programs
CREATE TABLE IF NOT EXISTS program_enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      UUID NOT NULL REFERENCES coaching_programs(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_date      DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  status          TEXT NOT NULL CHECK (status IN ('active', 'completed', 'dropped', 'paused', 'completed_with_distinction')) DEFAULT 'active',
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  final_grade     TEXT,
  certificate_id  TEXT,
  feedback        TEXT,
  rating          DECIMAL(2,1) CHECK (rating BETWEEN 0 AND 5),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(program_id, client_id)
);

-- Create program_sessions table linking sessions to programs
CREATE TABLE IF NOT EXISTS program_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      UUID NOT NULL REFERENCES coaching_programs(id) ON DELETE CASCADE,
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  session_order   INTEGER NOT NULL, -- order within the program
  week_number     INTEGER,
  session_type    TEXT CHECK (session_type IN ('lecture', 'practical', 'assessment', 'review', 'doubt_clearing')),
  is_mandatory    BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create assignments table for homework and tasks
CREATE TABLE IF NOT EXISTS assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  program_id      UUID REFERENCES coaching_programs(id) ON DELETE SET NULL,
  session_id      UUID REFERENCES sessions(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('homework', 'project', 'quiz', 'practice', 'reading', 'video')),
  due_date        TIMESTAMPTZ,
  max_points      DECIMAL(5,2) DEFAULT 100,
  passing_score   DECIMAL(5,2) DEFAULT 40,
  instructions    TEXT,
  resources       JSONB DEFAULT '[]'::jsonb, -- links to files, videos, etc.
  submission_type TEXT CHECK (submission_type IN ('text', 'file', 'url', 'image', 'video', 'audio')),
  late_submission_allowed BOOLEAN DEFAULT true,
  late_penalty_percent DECIMAL(5,2) DEFAULT 10,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create assignment_submissions table for student submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id   UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id      UUID REFERENCES students(id) ON DELETE SET NULL,
  client_id       UUID REFERENCES client_profiles(id) ON DELETE SET NULL,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  submission_type TEXT CHECK (submission_type IN ('text', 'file', 'url', 'image', 'video', 'audio')),
  content         TEXT, -- for text submissions
  file_url        TEXT, -- for file submissions
  file_name       TEXT,
  points_earned   DECIMAL(5,2),
  graded_by       UUID REFERENCES coach_profiles(id) ON DELETE SET NULL,
  graded_at       TIMESTAMPTZ,
  feedback        TEXT,
  is_late         BOOLEAN DEFAULT false,
  late_penalty_applied DECIMAL(5,2) DEFAULT 0,
  status          TEXT NOT NULL CHECK (status IN ('submitted', 'graded', 'returned', 'needs_revision')) DEFAULT 'submitted',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create session_notes table for coaches to take notes during/after sessions
CREATE TABLE IF NOT EXISTS session_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES client_profiles(id) ON DELETE SET NULL,
  student_id      UUID REFERENCES students(id) ON DELETE SET NULL,
  notes_type      TEXT NOT NULL CHECK (notes_type IN ('session_summary', 'progress_note', 'behavioral_note', 'concern', 'achievement')),
  title           TEXT,
  content         TEXT NOT NULL,
  mood            TEXT CHECK (mood IN ('positive', 'neutral', 'concerning', 'excellent', 'needs_improvement')),
  energy_level    INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  focus_level     INTEGER CHECK (focus_level BETWEEN 1 AND 10),
  participation   INTEGER CHECK (participation BETWEEN 1 AND 10),
  homework_completed TEXT CHECK (homework_completed IN ('yes', 'partial', 'no', 'not_assigned')),
  next_steps      TEXT,
  resources_shared JSONB DEFAULT '[]'::jsonb,
  follow_up_needed BOOLEAN DEFAULT false,
  follow_up_date  DATE,
  is_private      BOOLEAN DEFAULT false, -- if true, only coach can see
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create session_templates table for reusable session structures
CREATE TABLE IF NOT EXISTS session_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  session_type    TEXT CHECK (session_type IN ('one_on_one', 'group', 'workshop', 'assessment', 'feedback')),
  duration_minutes INTEGER DEFAULT 60,
  agenda_template JSONB DEFAULT '[]'::jsonb,
  objectives_template JSONB DEFAULT '[]'::jsonb,
  materials_template JSONB DEFAULT '[]'::jsonb,
  homework_template JSONB DEFAULT '[]'::jsonb,
  is_active       BOOLEAN DEFAULT true,
  usage_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coaching_programs_institute ON coaching_programs(institute_id);
CREATE INDEX IF NOT EXISTS idx_coaching_programs_coach ON coaching_programs(coach_id);
CREATE INDEX IF NOT EXISTS idx_coaching_programs_status ON coaching_programs(status);
CREATE INDEX IF NOT EXISTS idx_coaching_programs_category ON coaching_programs(category);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_program ON program_enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_client ON program_enrollments(client_id);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_status ON program_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_program_sessions_program ON program_sessions(program_id);
CREATE INDEX IF NOT EXISTS idx_program_sessions_session ON program_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_assignments_institute ON assignments(institute_id);
CREATE INDEX IF NOT EXISTS idx_assignments_coach ON assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_assignments_program ON assignments(program_id);
CREATE INDEX IF NOT EXISTS idx_assignments_session ON assignments(session_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_client ON assignment_submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_session_notes_session ON session_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_coach ON session_notes(coach_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_client ON session_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_student ON session_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_session_templates_institute ON session_templates(institute_id);
CREATE INDEX IF NOT EXISTS idx_session_templates_coach ON session_templates(coach_id);

-- Enable RLS on new tables
ALTER TABLE coaching_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for coaching_programs
CREATE POLICY coaching_programs_owner_all ON coaching_programs
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY coaching_programs_coach_read ON coaching_programs
  FOR SELECT USING (coach_id IN (SELECT id FROM coach_profiles WHERE profile_id = auth.uid()));
CREATE POLICY coaching_programs_client_read ON coaching_programs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM program_enrollments
      WHERE program_enrollments.program_id = coaching_programs.id
        AND program_enrollments.client_id IN (
          SELECT id FROM client_profiles WHERE profile_id = auth.uid()
        )
        AND program_enrollments.status IN ('active', 'completed')
    )
  );

-- RLS policies for program_enrollments
CREATE POLICY program_enrollments_owner_all ON program_enrollments
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY program_enrollments_access ON program_enrollments
  FOR SELECT USING (
    program_id IN (
      SELECT id FROM coaching_programs WHERE institute_id = get_my_institute_id()
    ) OR
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    )
  );
CREATE POLICY program_enrollments_update_own ON program_enrollments
  FOR UPDATE USING (
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    )
  );

-- RLS policies for program_sessions
CREATE POLICY program_sessions_owner_all ON program_sessions
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY program_sessions_read ON program_sessions
  FOR SELECT USING (
    program_id IN (
      SELECT id FROM coaching_programs WHERE institute_id = get_my_institute_id()
    )
  );

-- RLS policies for assignments
CREATE POLICY assignments_owner_all ON assignments
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY assignments_coach_read ON assignments
  FOR SELECT USING (coach_id IN (SELECT id FROM coach_profiles WHERE profile_id = auth.uid()));
CREATE POLICY assignments_client_read ON assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM program_enrollments
      WHERE program_enrollments.assignment_id = assignments.id
        AND program_enrollments.client_id IN (
          SELECT id FROM client_profiles WHERE profile_id = auth.uid()
        )
        AND program_enrollments.status IN ('active', 'completed')
    )
  );

-- RLS policies for assignment_submissions
CREATE POLICY assignment_submissions_owner_all ON assignment_submissions
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY assignment_submissions_access ON assignment_submissions
  FOR SELECT USING (
    assignment_id IN (
      SELECT id FROM assignments WHERE institute_id = get_my_institute_id()
    ) OR
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    ) OR
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    )
  );
CREATE POLICY assignment_submissions_update_own ON assignment_submissions
  FOR UPDATE USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    ) OR
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    )
  );

-- RLS policies for session_notes
CREATE POLICY session_notes_owner_all ON session_notes
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY session_notes_coach_read ON session_notes
  FOR SELECT USING (coach_id IN (SELECT id FROM coach_profiles WHERE profile_id = auth.uid()));
CREATE POLICY session_notes_client_read ON session_notes
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    ) AND
    (is_private = false OR is_private IS NULL)
  );
CREATE POLICY session_notes_student_read ON session_notes
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    ) AND
    (is_private = false OR is_private IS NULL)
  );

-- RLS policies for session_templates
CREATE POLICY session_templates_owner_all ON session_templates
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY session_templates_coach_read ON session_templates
  FOR SELECT USING (coach_id IN (SELECT id FROM coach_profiles WHERE profile_id = auth.uid()));

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_coaching_programs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_program_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_program_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_assignment_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_session_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_session_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER trg_updated_coaching_programs
  BEFORE UPDATE ON coaching_programs FOR EACH ROW EXECUTE FUNCTION update_coaching_programs_updated_at();

CREATE TRIGGER trg_updated_program_enrollments
  BEFORE UPDATE ON program_enrollments FOR EACH ROW EXECUTE FUNCTION update_program_enrollments_updated_at();

CREATE TRIGGER trg_updated_program_sessions
  BEFORE UPDATE ON program_sessions FOR EACH ROW EXECUTE FUNCTION update_program_sessions_updated_at();

CREATE TRIGGER trg_updated_assignments
  BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_assignments_updated_at();

CREATE TRIGGER trg_updated_assignment_submissions
  BEFORE UPDATE ON assignment_submissions FOR EACH ROW EXECUTE FUNCTION update_assignment_submissions_updated_at();

CREATE TRIGGER trg_updated_session_notes
  BEFORE UPDATE ON session_notes FOR EACH ROW EXECUTE FUNCTION update_session_notes_updated_at();

CREATE TRIGGER trg_updated_session_templates
  BEFORE UPDATE ON session_templates FOR EACH ROW EXECUTE FUNCTION update_session_templates_updated_at();

-- Add comments
COMMENT ON TABLE coaching_programs IS 'Structured coaching programs or courses offered by coaches';
COMMENT ON COLUMN coaching_programs.category IS 'Broad category of the coaching program';
COMMENT ON COLUMN coaching_programs.level IS 'Difficulty level of the program';
COMMENT ON COLUMN coaching_programs.curriculum IS 'JSON array detailing the weekly/daily curriculum structure';
COMMENT ON COLUMN coaching_programs.learning_outcomes IS 'JSON array of expected learning outcomes';
COMMENT ON COLUMN coaching_programs.materials_included IS 'JSON array of materials included with the program';
COMMENT ON COLUMN coaching_programs.assessment_method IS 'JSON object detailing how learning will be assessed';
COMMENT ON TABLE program_enrollments IS 'Tracking client enrollment in coaching programs';
COMMENT ON COLUMN program_enrollments.progress_percentage IS 'Percentage of program completed (0-100)';
COMMENT ON COLUMN program_enrollments.final_grade IS 'Final grade earned in the program';
COMMENT ON TABLE program_sessions IS 'Links specific sessions to their parent programs';
COMMENT ON COLUMN program_sessions.session_order IS 'The order of this session within the program';
COMMENT ON TABLE assignments IS 'Homework, projects, quizzes, and other assignments';
COMMENT ON COLUMN assignments.assignment_type IS 'Type of assignment';
COMMENT ON COLUMN assignment_submissions IS 'Student submissions to assignments';
COMMENT ON COLUMN assignment_submissions.status IS 'Current status of the submission';
COMMENT ON COLUMN assignment_submissions.is_late IS 'Whether submission was submitted after due date';
COMMENT ON TABLE session_notes IS 'Notes taken by coaches during or after sessions';
COMMENT ON COLUMN session_notes.notes_type IS 'Type of session note';
COMMENT ON COLUMN session_notes.mood IS 'Overall mood/energy observed during session';
COMMENT ON COLUMN session_notes.energy_level IS 'Self-assessed energy level (1-10 scale)';
COMMENT ON COLUMN session_notes.focus_level IS 'Self-assessed focus level (1-10 scale)';
COMMENT ON COLUMN session_notes.participation IS 'Self-assessed participation level (1-10 scale)';
COMMENT ON COLUMN session_notes.homework_completed IS 'Status of assigned homework';
COMMENT ON TABLE session_templates IS 'Reusable templates for creating sessions quickly';
COMMENT ON COLUMN session_templates.usage_count IS 'Number of times this template has been used';