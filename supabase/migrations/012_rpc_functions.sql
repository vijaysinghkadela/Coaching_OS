-- =====================================================================
-- RPC FUNCTIONS — computed analytics called from application layer
-- =====================================================================

-- 1. At-risk students: attendance < 60% OR avg recent score < 40%
CREATE OR REPLACE FUNCTION get_at_risk_students(p_institute_id UUID)
RETURNS TABLE (
  student_id     UUID,
  full_name      TEXT,
  enrollment_no  TEXT,
  attendance_pct NUMERIC,
  avg_score_pct  NUMERIC,
  batch_name     TEXT
) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  WITH att AS (
    SELECT
      ar.student_id,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE ar.status IN ('present','late'))
        / NULLIF(COUNT(*), 0),
        1
      ) AS attendance_pct
    FROM attendance_records ar
    JOIN attendance_sessions s ON s.id = ar.session_id
    WHERE s.institute_id = p_institute_id
      AND s.session_date >= CURRENT_DATE - INTERVAL '60 days'
    GROUP BY ar.student_id
  ),
  scores AS (
    SELECT
      ts.student_id,
      ROUND(
        100.0 * AVG(ts.marks_obtained::NUMERIC / NULLIF(ts.max_marks, 0)),
        1
      ) AS avg_score_pct
    FROM test_scores ts
    JOIN tests t ON t.id = ts.test_id
    WHERE t.institute_id = p_institute_id
      AND t.test_date >= CURRENT_DATE - INTERVAL '60 days'
      AND ts.is_absent = FALSE
    GROUP BY ts.student_id
  )
  SELECT
    s.id            AS student_id,
    s.full_name,
    s.enrollment_no,
    COALESCE(a.attendance_pct, 0) AS attendance_pct,
    COALESCE(sc.avg_score_pct, 0) AS avg_score_pct,
    b.name AS batch_name
  FROM students s
  LEFT JOIN att a ON a.student_id = s.id
  LEFT JOIN scores sc ON sc.student_id = s.id
  LEFT JOIN batches b ON b.id = s.batch_id
  WHERE s.institute_id = p_institute_id
    AND s.status = 'active'
    AND (
      COALESCE(a.attendance_pct, 0) < 60
      OR COALESCE(sc.avg_score_pct, 0) < 40
    )
  ORDER BY COALESCE(a.attendance_pct, 0) ASC;
$$;

-- 2. Today's overall attendance % for an institute
CREATE OR REPLACE FUNCTION get_today_attendance_pct(p_institute_id UUID)
RETURNS NUMERIC LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE ar.status IN ('present','late'))
      / NULLIF(COUNT(*), 0),
      0
    )
  FROM attendance_records ar
  JOIN attendance_sessions s ON s.id = ar.session_id
  WHERE s.institute_id = p_institute_id
    AND s.session_date = CURRENT_DATE;
$$;

-- 3. Trigger absence alerts after a session is marked
--    Queues a WhatsApp message for students with 3+ consecutive absences
CREATE OR REPLACE FUNCTION trigger_absence_alerts(p_session_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_institute_id UUID;
  v_batch_id     UUID;
  v_session_date DATE;
  rec            RECORD;
BEGIN
  SELECT institute_id, batch_id, session_date
    INTO v_institute_id, v_batch_id, v_session_date
  FROM attendance_sessions
  WHERE id = p_session_id;

  -- Find students absent in the last 3 consecutive sessions for this batch
  FOR rec IN
    WITH last3 AS (
      SELECT
        ar.student_id,
        ar.status,
        ROW_NUMBER() OVER (
          PARTITION BY ar.student_id
          ORDER BY s.session_date DESC
        ) AS rn
      FROM attendance_records ar
      JOIN attendance_sessions s ON s.id = ar.session_id
      WHERE s.batch_id = v_batch_id
        AND s.session_date <= v_session_date
    )
    SELECT student_id
    FROM last3
    WHERE rn <= 3
    GROUP BY student_id
    HAVING COUNT(*) FILTER (WHERE status = 'absent') = 3
  LOOP
    -- Queue a WhatsApp message (will be sent by send-whatsapp Edge Function)
    INSERT INTO whatsapp_messages (
      institute_id, student_id, message_type,
      content, status
    )
    SELECT
      v_institute_id,
      rec.student_id,
      'attendance_alert',
      format(
        'Dear parent, your child %s has been absent for 3 consecutive classes. Please contact the institute.',
        s.full_name
      ),
      'queued'
    FROM students s
    WHERE s.id = rec.student_id
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- 4. Recompute ranks for all students in a test after marks are saved
CREATE OR REPLACE FUNCTION recompute_test_ranks(p_test_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Update rank_in_batch using window function
  UPDATE test_scores ts
  SET
    rank_in_batch = ranks.rnk,
    percentile    = ROUND(
      100.0 * (1 - (ranks.rnk - 1)::NUMERIC / NULLIF(ranks.total - 1, 0)),
      1
    )
  FROM (
    SELECT
      id,
      RANK() OVER (ORDER BY marks_obtained DESC) AS rnk,
      COUNT(*) OVER () AS total
    FROM test_scores
    WHERE test_id = p_test_id
      AND is_absent = FALSE
  ) ranks
  WHERE ts.id = ranks.id
    AND ts.test_id = p_test_id;
END;
$$;

-- Grant execute to authenticated role
GRANT EXECUTE ON FUNCTION get_at_risk_students(UUID)     TO authenticated;
GRANT EXECUTE ON FUNCTION get_today_attendance_pct(UUID)  TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_absence_alerts(UUID)    TO authenticated;
GRANT EXECUTE ON FUNCTION recompute_test_ranks(UUID)      TO authenticated;
