-- ============================================================================
-- Coaching OS — Migration 017: Goal Setting and Progress Tracking
-- ============================================================================

-- Create goals table for SMART goal setting
CREATE TABLE IF NOT EXISTS goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  coach_id        UUID REFERENCES coach_profiles(id) ON DELETE SET NULL,
  client_id       UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  student_id      UUID REFERENCES students(id) ON DELETE SET NULL,
  program_id      UUID REFERENCES coaching_programs(id) ON DELETE SET NULL,
  session_id      UUID REFERENCES sessions(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  goal_type       TEXT NOT NULL CHECK (goal_type IN ('academic', 'skill', 'habit', 'behavioral', 'outcome', 'process')),
  category        TEXT, -- e.g., 'mathematics', 'communication', 'time_management'
  target_value    DECIMAL(10,2),
  current_value   DECIMAL(10,2) DEFAULT 0,
  unit_of_measure TEXT, -- e.g., 'points', 'hours', 'sessions', 'percentage'
  target_date     DATE,
  status          TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'achieved', 'partially_achieved', 'failed', 'on_hold')) DEFAULT 'not_started',
  priority        TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  success_criteria TEXT, -- how achievement will be measured
  milestones      JSONB DEFAULT '[]'::jsonb, -- breaking down the goal into smaller steps
  action_plan     JSONB DEFAULT '[]'::jsonb, -- specific actions to achieve the goal
  resources_needed JSONB DEFAULT '[]'::jsonb,
  obstacles       JSONB DEFAULT '[]'::jsonb, -- anticipated challenges
  motivation      TEXT, -- why this goal is important to the client
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at     TIMESTAMPTZ
);

-- Create goal_progress table for tracking progress updates
CREATE TABLE IF NOT EXISTS goal_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id         UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  progress_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  progress_value  DECIMAL(10,2),
  progress_note   TEXT,
  evidence        JSONB DEFAULT '[]'::jsonb, -- links to documents, images, etc. as proof
  updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL, -- who updated the progress
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create habit_tracking table for daily/weekly habit monitoring
CREATE TABLE IF NOT EXISTS habit_tracking (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  student_id      UUID REFERENCES students(id) ON DELETE SET NULL,
  habit_name      TEXT NOT NULL,
  habit_description TEXT,
  frequency       TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  target_days_per_period INTEGER, -- e.g., 5 days per week for weekly frequency
  start_date      DATE,
  end_date        DATE,
  streak_count    INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  status          TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed', 'dropped')) DEFAULT 'active',
  reminder_time   TIME, -- time of day for reminder
  reminder_days   TEXT[] DEFAULT '{}'::text[], -- days of week for reminder (0-6, where 0 is Sunday)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create habit_log table for logging habit completion
CREATE TABLE IF NOT EXISTS habit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id        UUID NOT NULL REFERENCES habit_tracking(id) ON DELETE CASCADE,
  log_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  completed       BOOLEAN DEFAULT false,
  notes           TEXT,
  evidence        JSONB DEFAULT '[]'::jsonb, -- links to proof of completion
  logged_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create progress_reports table for periodic progress summaries
CREATE TABLE IF NOT EXISTS progress_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  period_type     TEXT NOT NULL CHECK (period_type IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  report_data     JSONB NOT NULL, -- comprehensive progress data
  highlights      TEXT,
  areas_for_improvement TEXT,
  next_steps      TEXT,
  client_comments TEXT,
  coach_comments  TEXT,
  shared_with_client BOOLEAN DEFAULT false,
  shared_with_coach BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create achievements_badges table for gamification
CREATE TABLE IF NOT EXISTS achievements_badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  badge_type      TEXT NOT NULL CHECK (badge_type IN ('goal_achievement', 'streak', 'milestone', 'participation', 'improvement', 'excellence')),
  criteria        JSONB NOT NULL, -- conditions for earning the badge
  image_url       TEXT,
  points_value    INTEGER DEFAULT 10,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_achievements table for tracking earned badges
CREATE TABLE IF NOT EXISTS user_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  badge_id        UUID NOT NULL REFERENCES achievements_badges(id) ON DELETE CASCADE,
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  earned_for      TEXT, -- goal_id, habit_id, etc. that led to earning this badge
  evidencia       JSONB DEFAULT '[]'::jsonb, -- proof/context for earning the badge
  notified        BOOLEAN DEFAULT false
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_goals_institute ON goals(institute_id);
CREATE INDEX IF NOT EXISTS idx_goals_coach ON goals(coach_id);
CREATE INDEX IF NOT EXISTS idx_goals_client ON goals(client_id);
CREATE INDEX IF NOT EXISTS idx_goals_student ON goals(student_id);
CREATE INDEX IF NOT EXISTS idx_goals_program ON goals(program_id);
CREATE INDEX IF NOT EXISTS idx_goals_session ON goals(session_id);
CREATE INDEX IF NOT EXISTS idx_goals_goal_type ON goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON goals(priority);
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal ON goal_progress(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_date ON goal_progress(progress_date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_tracking_institute ON habit_tracking(institute_id);
CREATE INDEX IF NOT EXISTS idx_habit_tracking_client ON habit_tracking(client_id);
CREATE INDEX IF NOT EXISTS idx_habit_tracking_student ON habit_tracking(student_id);
CREATE INDEX IF NOT EXISTS idx_habit_log_habit ON habit_log(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_log_date ON habit_log(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_progress_reports_institute ON progress_reports(institute_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_client ON progress_reports(client_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_coach ON progress_reports(coach_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_period ON progress_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_achievements_badges_institute ON achievements_badges(institute_id);
CREATE INDEX IF NOT EXISTS idx_achievements_badges_type ON achievements_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_client ON user_achievements(client_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_badge ON user_achievements(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned ON user_achievements(earned_at DESC);

-- Enable RLS on new tables
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for goals
CREATE POLICY goals_owner_all ON goals
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY goals_coach_read ON goals
  FOR SELECT USING (
    coach_id IN (SELECT id FROM coach_profiles WHERE profile_id = auth.uid())
  );
CREATE POLICY goals_client_read ON goals
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    )
  );
CREATE POLICY goals_student_read ON goals
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );
CREATE POLICY goals_program_read ON goals
  FOR SELECT USING (
    program_id IN (
      SELECT id FROM coaching_programs WHERE institute_id = get_my_institute_id()
    )
  );
CREATE POLICY goals_session_read ON goals
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM sessions WHERE institute_id = get_my_institute_id()
    )
  );

-- RLS policies for goal_progress
CREATE POLICY goal_progress_owner_all ON goal_progress
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY goal_progress_access ON goal_progress
  FOR SELECT USING (
    goal_id IN (
      SELECT id FROM goals WHERE institute_id = get_my_institute_id()
    )
  );
CREATE POLICY goal_progress_update_own ON goal_progress
  FOR UPDATE USING (
    updated_by IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS policies for habit_tracking
CREATE POLICY habit_tracking_owner_all ON habit_tracking
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY habit_tracking_client_read ON habit_tracking
  FOR SELECT USING (client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid()));
CREATE POLICY habit_tracking_student_read ON habit_tracking
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- RLS policies for habit_log
CREATE POLICY habit_log_owner_all ON habit_log
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY habit_log_access ON habit_log
  FOR SELECT USING (
    habit_id IN (
      SELECT id FROM habit_tracking WHERE institute_id = get_my_institute_id()
    ) OR
    logged_by IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );
CREATE POLICY habit_log_insert_own ON habit_log
  FOR INSERT WITH CHECK (
    logged_by IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS policies for progress_reports
CREATE POLICY progress_reports_owner_all ON progress_reports
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY progress_reports_access ON progress_reports
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    ) OR
    coach_id IN (
      SELECT id FROM coach_profiles WHERE profile_id = auth.uid()
    )
  );
CREATE POLICY progress_reports_update_coach ON progress_reports
  FOR UPDATE USING (coach_id IN (SELECT id FROM coach_profiles WHERE profile_id = auth.uid()));
CREATE POLICY progress_reports_update_client ON progress_reports
  FOR UPDATE USING (client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid()));

-- RLS policies for achievements_badges
CREATE POLICY achievements_badges_owner_all ON achievements_badges
  FOR ALL USING (institute_id = get_my_institute_id());

-- RLS policies for user_achievements
CREATE POLICY user_achievements_owner_all ON user_achievements
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY user_achievements_client_read ON user_achievements
  FOR SELECT USING (client_id IN (SELECT id FROM client_profiles WHERE profile_id = auth.uid()));
CREATE POLICY user_achievements_badge_read ON user_achievements
  FOR SELECT USING (badge_id IN (SELECT id FROM achievements_badges WHERE institute_id = get_my_institute_id()));
CREATE POLICY user_achievements_update_own ON user_achievements
  FOR UPDATE USING (
    client_id IN (
      SELECT id FROM client_profiles WHERE profile_id = auth.uid()
    )
  );

-- Create trigger functions for updated_at and archived_at
CREATE OR REPLACE FUNCTION update_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_goals_archived_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'achieved' AND NEW.archived_at IS NULL THEN
    NEW.archived_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_goal_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_habit_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_habit_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_progress_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_achievements_badges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_user_achievements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER trg_updated_goals
  BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_goals_updated_at();

CREATE TRIGGER trg_update_goals_archived_at
  BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_goals_archived_at();

CREATE TRIGGER trg_updated_goal_progress
  BEFORE UPDATE ON goal_progress FOR EACH ROW EXECUTE FUNCTION update_goal_progress_updated_at();

CREATE TRIGGER trg_updated_habit_tracking
  BEFORE UPDATE ON habit_tracking FOR EACH ROW EXECUTE FUNCTION update_habit_tracking_updated_at();

CREATE TRIGGER trg_updated_habit_log
  BEFORE UPDATE ON habit_log FOR EACH ROW EXECUTE FUNCTION update_habit_log_updated_at();

CREATE TRIGGER trg_updated_progress_reports
  BEFORE UPDATE ON progress_reports FOR EACH ROW EXECUTE FUNCTION update_progress_reports_updated_at();

CREATE TRIGGER trg_updated_achievements_badges
  BEFORE UPDATE ON achievements_badges FOR EACH ROW EXECUTE FUNCTION update_achievements_badges_updated_at();

CREATE TRIGGER trg_updated_user_achievements
  BEFORE UPDATE ON user_achievements FOR EACH ROW EXECUTE FUNCTION update_user_achievements_updated_at();

-- Add comments
COMMENT ON TABLE goals IS 'SMART goals set by clients with coach guidance';
COMMENT ON COLUMN goals.goal_type IS 'Type of goal being pursued';
COMMENT ON COLUMN goals.category IS 'Subject or skill area the goal relates to';
COMMENT ON COLUMN goals.target_value IS 'The specific target value to achieve';
COMMENT ON COLUMN goals.current_value IS 'Current progress toward the target';
COMMENT ON COLUMN goals.unit_of_measure IS 'Unit of measurement for the goal';
COMMENT ON COLUMN goals.target_date IS 'Date by which the goal should be achieved';
COMMENT ON COLUMN goals.status IS 'Current status of goal pursuit';
COMMENT ON COLUMN goals.priority IS 'Priority level of the goal';
COMMENT ON COLUMN goals.success_criteria IS 'How achievement of the goal will be determined';
COMMENT ON COLUMN goals.milestones IS 'JSON array breaking the goal into smaller steps';
COMMENT ON COLUMN goals.action_plan IS 'JSON array of specific actions to take';
COMMENT ON COLUMN goals.resources_needed IS 'JSON array of resources needed';
COMMENT ON COLUMN goals.obstacles IS 'JSON array of anticipated challenges';
COMMENT ON COLUMN goals.motivation IS 'Why this goal matters to the client';
COMMENT ON TABLE goal_progress IS 'Updates tracking progress toward goals';
COMMENT ON COLUMN goal_progress.progress_value IS 'The value achieved at this progress point';
COMMENT ON COLUMN goal_progress.progress_note IS 'Notes about what contributed to this progress';
COMMENT ON COLUMN goal_progress.evidence IS 'JSON array linking to proof of progress';
COMMENT ON COLUMN goal_progress.updated_by IS 'Who recorded this progress update';
COMMENT ON TABLE habit_tracking IS 'Tracking of daily/weekly habits to build';
COMMENT ON COLUMN habit_tracking.frequency IS 'How often the habit should be performed';
COMMENT ON COLUMN habit_tracking.target_days_per_period IS 'Target number of completions per period';
COMMENT ON COLUMN habit_tracking.streak_count IS 'Current consecutive days/weeks completed';
COMMENT ON COLUMN habit_tracking.longest_streak IS 'Maximum consecutive days/weeks ever completed';
COMMENT ON COLUMN habit_tracking.reminder_time IS 'Time of day to send reminder';
COMMENT ON COLUMN habit_tracking.reminder_days IS 'Array of days (0-6) when reminders should be sent';
COMMENT ON TABLE habit_log IS 'Daily logging of habit completion or non-completion';
COMMENT ON COLUMN habit_log.completed IS 'Whether the habit was completed on this day';
COMMENT ON COLUMN habit_log.notes IS 'Any notes about the habit attempt';
COMMENT ON COLUMN habit_log.evidence IS 'JSON array linking to proof of completion';
COMMENT ON COLUMN habit_log.logged_by IS 'Who logged this habit entry';
COMMENT ON TABLE progress_reports IS 'Periodic comprehensive progress reports';
COMMENT ON COLUMN progress_reports.period_type IS 'Time period covered by the report';
COMMENT ON COLUMN progress_reports.period_start IS 'Start date of the reporting period';
COMMENT ON COLUMN progress_reports.period_end IS 'End date of the reporting period';
COMMENT ON COLUMN progress_reports.report_data IS 'Comprehensive JSON data for the period';
COMMENT ON COLUMN progress_reports.highlights IS 'Key achievements and positive developments';
COMMENT ON COLUMN progress_reports.areas_for_improvement IS 'Areas needing attention or development';
COMMENT ON COLUMN progress_reports.next_steps IS 'Recommended actions for continued progress';
COMMENT ON COLUMN progress_reports.shared_with_client IS 'Whether client has viewed this report';
COMMENT ON COLUMN progress_reports.shared_with_coach IS 'Whether coach has viewed this report';
COMMENT ON TABLE achievements_badges IS 'Definitions of achievements that can be earned';
COMMENT ON COLUMN achievements_badges.name IS 'Short name or title of the badge';
COMMENT ON COLUMN achievements_badges.description IS 'Detailed explanation of what the badge represents';
COMMENT ON COLUMN achievements_badges.badge_type IS 'Category of achievement';
COMMENT ON COLUMN achievements_badges.criteria IS 'JSON object defining the requirements to earn';
COMMENT ON COLUMN achievements_badges.image_url IS 'URL to the visual representation of the badge';
COMMENT ON COLUMN achievements_badges.points_value IS 'Gamification points awarded for earning';
COMMENT ON TABLE user_achievements IS 'Tracking which badges users have earned';
COMMENT ON COLUMN user_achievements.earned_for IS 'What specific achievement led to earning this badge';
COMMENT ON COLUMN user_achievements.evidencia IS 'JSON array providing context/proof for earning';
COMMENT ON COLUMN user_achievements.notified IS 'Whether user has been notified of earning this badge';