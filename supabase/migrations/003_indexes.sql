-- ============================================================================
-- Coaching OS — Migration 003: Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_institutes_owner      ON institutes(owner_id);
CREATE INDEX IF NOT EXISTS idx_im_institute          ON institute_members(institute_id);
CREATE INDEX IF NOT EXISTS idx_im_user               ON institute_members(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_institute     ON courses(institute_id);
CREATE INDEX IF NOT EXISTS idx_rooms_institute       ON rooms(institute_id);
CREATE INDEX IF NOT EXISTS idx_teachers_institute    ON teachers(institute_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user         ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_batches_institute     ON batches(institute_id);
CREATE INDEX IF NOT EXISTS idx_batches_course        ON batches(course_id);
CREATE INDEX IF NOT EXISTS idx_slots_batch           ON timetable_slots(batch_id);
CREATE INDEX IF NOT EXISTS idx_slots_teacher         ON timetable_slots(teacher_id);
CREATE INDEX IF NOT EXISTS idx_slots_room            ON timetable_slots(room_id);
CREATE INDEX IF NOT EXISTS idx_students_institute    ON students(institute_id);
CREATE INDEX IF NOT EXISTS idx_students_batch        ON students(batch_id);
CREATE INDEX IF NOT EXISTS idx_students_course       ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_students_phone        ON students(institute_id, phone);
CREATE INDEX IF NOT EXISTS idx_students_active       ON students(institute_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_docs_student          ON student_documents(student_id);
