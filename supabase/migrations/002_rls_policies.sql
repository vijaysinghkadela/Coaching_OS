-- ============================================================================
-- Coaching OS — Migration 002: Row Level Security
-- ============================================================================

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE institute_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms             ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches           ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots   ENABLE ROW LEVEL SECURITY;
ALTER TABLE students          ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;

-- Helper: get institute_id for authenticated user as owner
CREATE OR REPLACE FUNCTION get_my_institute_id()
RETURNS UUID AS $$
  SELECT id FROM institutes WHERE owner_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: check if user is teacher at institute
CREATE OR REPLACE FUNCTION is_teacher_at(p_institute_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM institute_members
    WHERE institute_id = p_institute_id
      AND user_id = auth.uid()
      AND role = 'teacher'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── PROFILES ────────────────────────────────────────────────────────────────
CREATE POLICY profiles_self ON profiles
  FOR ALL USING (auth.uid() = id);

-- ─── INSTITUTES ──────────────────────────────────────────────────────────────
CREATE POLICY institutes_owner_all ON institutes
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY institutes_member_read ON institutes
  FOR SELECT USING (
    id IN (SELECT institute_id FROM institute_members WHERE user_id = auth.uid())
  );

-- ─── INSTITUTE MEMBERS ───────────────────────────────────────────────────────
CREATE POLICY im_owner_all ON institute_members
  FOR ALL USING (institute_id = get_my_institute_id());

CREATE POLICY im_self_read ON institute_members
  FOR SELECT USING (user_id = auth.uid());

-- ─── COURSES ─────────────────────────────────────────────────────────────────
CREATE POLICY courses_owner_all ON courses
  FOR ALL USING (institute_id = get_my_institute_id());

CREATE POLICY courses_teacher_read ON courses
  FOR SELECT USING (is_teacher_at(institute_id));

-- ─── ROOMS ───────────────────────────────────────────────────────────────────
CREATE POLICY rooms_owner_all ON rooms
  FOR ALL USING (institute_id = get_my_institute_id());

CREATE POLICY rooms_teacher_read ON rooms
  FOR SELECT USING (is_teacher_at(institute_id));

-- ─── TEACHERS ────────────────────────────────────────────────────────────────
CREATE POLICY teachers_owner_all ON teachers
  FOR ALL USING (institute_id = get_my_institute_id());

CREATE POLICY teachers_self_read ON teachers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY teachers_colleague_read ON teachers
  FOR SELECT USING (is_teacher_at(institute_id));

-- ─── BATCHES ─────────────────────────────────────────────────────────────────
CREATE POLICY batches_owner_all ON batches
  FOR ALL USING (institute_id = get_my_institute_id());

CREATE POLICY batches_teacher_read ON batches
  FOR SELECT USING (is_teacher_at(institute_id));

-- ─── TIMETABLE SLOTS ─────────────────────────────────────────────────────────
CREATE POLICY slots_owner_all ON timetable_slots
  FOR ALL USING (institute_id = get_my_institute_id());

CREATE POLICY slots_teacher_read ON timetable_slots
  FOR SELECT USING (is_teacher_at(institute_id));

-- ─── STUDENTS ────────────────────────────────────────────────────────────────
CREATE POLICY students_owner_all ON students
  FOR ALL USING (institute_id = get_my_institute_id());

CREATE POLICY students_teacher_read ON students
  FOR SELECT USING (is_teacher_at(institute_id));

CREATE POLICY students_self_read ON students
  FOR SELECT USING (user_id = auth.uid());

-- ─── STUDENT DOCUMENTS ───────────────────────────────────────────────────────
CREATE POLICY docs_owner_all ON student_documents
  FOR ALL USING (institute_id = get_my_institute_id());

CREATE POLICY docs_teacher_read ON student_documents
  FOR SELECT USING (is_teacher_at(institute_id));
