// Demo data for Sharma Classes, Bikaner — realistic showcase data

export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'director@sharmaclasses.in',
  user_metadata: { full_name: 'Rajesh Sharma' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-06-01T00:00:00.000Z',
}

export const DEMO_INSTITUTE = {
  id: 'demo-inst-001',
  owner_id: 'demo-user-001',
  name: 'Sharma Classes',
  city: 'Bikaner',
  gstin: '08ABCDE1234F1Z5',
  plan_tier: 'pro',
  max_students: 9999,
  logo_url: null,
  onboarding_done: true,
  created_at: '2024-06-01T00:00:00.000Z',
  updated_at: '2024-06-01T00:00:00.000Z',
}

export const DEMO_PROFILES = [
  { id: 'demo-user-001', full_name: 'Rajesh Sharma', email: 'director@sharmaclasses.in', created_at: '2024-06-01T00:00:00.000Z' },
]

export const DEMO_COURSES = [
  { id: 'course-001', institute_id: 'demo-inst-001', name: 'JEE Mains + Advanced', subjects: ['Physics', 'Chemistry', 'Maths'], duration_months: 24, is_active: true },
  { id: 'course-002', institute_id: 'demo-inst-001', name: 'NEET Preparation', subjects: ['Physics', 'Chemistry', 'Biology'], duration_months: 24, is_active: true },
  { id: 'course-003', institute_id: 'demo-inst-001', name: '10th Board Excellence', subjects: ['Maths', 'Science', 'English', 'Hindi', 'Social Science'], duration_months: 12, is_active: true },
]

export const DEMO_ROOMS = [
  { id: 'room-001', institute_id: 'demo-inst-001', name: 'Room A', capacity: 40, is_active: true },
  { id: 'room-002', institute_id: 'demo-inst-001', name: 'Room B', capacity: 35, is_active: true },
  { id: 'room-003', institute_id: 'demo-inst-001', name: 'Lab (Physics)', capacity: 20, is_active: true },
]

export const DEMO_BATCHES = [
  { id: 'batch-001', institute_id: 'demo-inst-001', course_id: 'course-001', name: 'JEE 2026 Morning', academic_year: '2025-26', capacity: 35, status: 'active', created_at: '2024-06-01T00:00:00.000Z' },
  { id: 'batch-002', institute_id: 'demo-inst-001', course_id: 'course-002', name: 'NEET 2026 Batch A', academic_year: '2025-26', capacity: 30, status: 'active', created_at: '2024-07-01T00:00:00.000Z' },
  { id: 'batch-003', institute_id: 'demo-inst-001', course_id: 'course-003', name: '10th 2025-26', academic_year: '2025-26', capacity: 40, status: 'active', created_at: '2024-07-15T00:00:00.000Z' },
]

const JEE = { name: 'JEE 2026 Morning' }
const NEET = { name: 'NEET 2026 Batch A' }
const TENTH = { name: '10th 2025-26' }

export const DEMO_STUDENTS = [
  // JEE batch
  { id: 'stu-001', institute_id: 'demo-inst-001', batch_id: 'batch-001', course_id: 'course-001', enrollment_no: 'SHRM-0001', full_name: 'Arjun Mehta', phone: '9414001001', parent_phone: '9414002001', parent_name: 'Suresh Mehta', email: 'arjun@example.com', gender: 'male', date_of_birth: '2007-03-15', admission_date: '2024-06-10', status: 'active', created_at: '2024-06-10T09:00:00Z', batches: JEE, courses: { name: 'JEE Mains + Advanced' } },
  { id: 'stu-002', institute_id: 'demo-inst-001', batch_id: 'batch-001', course_id: 'course-001', enrollment_no: 'SHRM-0002', full_name: 'Priya Sharma', phone: '9414001002', parent_phone: '9414002002', parent_name: 'Mohan Sharma', email: 'priya@example.com', gender: 'female', date_of_birth: '2007-07-22', admission_date: '2024-06-10', status: 'active', created_at: '2024-06-10T10:00:00Z', batches: JEE, courses: { name: 'JEE Mains + Advanced' } },
  { id: 'stu-003', institute_id: 'demo-inst-001', batch_id: 'batch-001', course_id: 'course-001', enrollment_no: 'SHRM-0003', full_name: 'Rohit Agarwal', phone: '9414001003', parent_phone: '9414002003', parent_name: 'Ramesh Agarwal', email: 'rohit@example.com', gender: 'male', date_of_birth: '2007-11-08', admission_date: '2024-06-15', status: 'active', created_at: '2024-06-15T09:00:00Z', batches: JEE, courses: { name: 'JEE Mains + Advanced' } },
  { id: 'stu-004', institute_id: 'demo-inst-001', batch_id: 'batch-001', course_id: 'course-001', enrollment_no: 'SHRM-0004', full_name: 'Sneha Gupta', phone: '9414001004', parent_phone: '9414002004', parent_name: 'Vinod Gupta', email: 'sneha@example.com', gender: 'female', date_of_birth: '2007-04-30', admission_date: '2024-06-15', status: 'active', created_at: '2024-06-15T11:00:00Z', batches: JEE, courses: { name: 'JEE Mains + Advanced' } },
  { id: 'stu-005', institute_id: 'demo-inst-001', batch_id: 'batch-001', course_id: 'course-001', enrollment_no: 'SHRM-0005', full_name: 'Karan Bishnoi', phone: '9414001005', parent_phone: '9414002005', parent_name: 'Devi Lal Bishnoi', email: 'karan@example.com', gender: 'male', date_of_birth: '2006-12-19', admission_date: '2024-07-01', status: 'active', created_at: '2024-07-01T09:00:00Z', batches: JEE, courses: { name: 'JEE Mains + Advanced' } },
  // NEET batch
  { id: 'stu-006', institute_id: 'demo-inst-001', batch_id: 'batch-002', course_id: 'course-002', enrollment_no: 'SHRM-0006', full_name: 'Ananya Singh', phone: '9414001006', parent_phone: '9414002006', parent_name: 'Harpal Singh', email: 'ananya@example.com', gender: 'female', date_of_birth: '2007-01-12', admission_date: '2024-07-05', status: 'active', created_at: '2024-07-05T09:00:00Z', batches: NEET, courses: { name: 'NEET Preparation' } },
  { id: 'stu-007', institute_id: 'demo-inst-001', batch_id: 'batch-002', course_id: 'course-002', enrollment_no: 'SHRM-0007', full_name: 'Vikram Rao', phone: '9414001007', parent_phone: '9414002007', parent_name: 'Shyam Rao', email: 'vikram@example.com', gender: 'male', date_of_birth: '2007-05-25', admission_date: '2024-07-05', status: 'active', created_at: '2024-07-05T10:00:00Z', batches: NEET, courses: { name: 'NEET Preparation' } },
  { id: 'stu-008', institute_id: 'demo-inst-001', batch_id: 'batch-002', course_id: 'course-002', enrollment_no: 'SHRM-0008', full_name: 'Pooja Choudhary', phone: '9414001008', parent_phone: '9414002008', parent_name: 'Babu Lal Choudhary', email: 'pooja@example.com', gender: 'female', date_of_birth: '2007-09-03', admission_date: '2024-07-10', status: 'active', created_at: '2024-07-10T09:00:00Z', batches: NEET, courses: { name: 'NEET Preparation' } },
  { id: 'stu-009', institute_id: 'demo-inst-001', batch_id: 'batch-002', course_id: 'course-002', enrollment_no: 'SHRM-0009', full_name: 'Rahul Verma', phone: '9414001009', parent_phone: '9414002009', parent_name: 'Prakash Verma', email: 'rahul@example.com', gender: 'male', date_of_birth: '2007-02-14', admission_date: '2024-07-10', status: 'active', created_at: '2024-07-10T11:00:00Z', batches: NEET, courses: { name: 'NEET Preparation' } },
  // 10th batch
  { id: 'stu-010', institute_id: 'demo-inst-001', batch_id: 'batch-003', course_id: 'course-003', enrollment_no: 'SHRM-0010', full_name: 'Divya Joshi', phone: '9414001010', parent_phone: '9414002010', parent_name: 'Naresh Joshi', email: 'divya@example.com', gender: 'female', date_of_birth: '2009-06-18', admission_date: '2024-07-15', status: 'active', created_at: '2024-07-15T09:00:00Z', batches: TENTH, courses: { name: '10th Board Excellence' } },
  { id: 'stu-011', institute_id: 'demo-inst-001', batch_id: 'batch-003', course_id: 'course-003', enrollment_no: 'SHRM-0011', full_name: 'Amit Saini', phone: '9414001011', parent_phone: '9414002011', parent_name: 'Gajraj Saini', email: 'amit@example.com', gender: 'male', date_of_birth: '2009-08-27', admission_date: '2024-07-15', status: 'active', created_at: '2024-07-15T10:00:00Z', batches: TENTH, courses: { name: '10th Board Excellence' } },
  { id: 'stu-012', institute_id: 'demo-inst-001', batch_id: 'batch-003', course_id: 'course-003', enrollment_no: 'SHRM-0012', full_name: 'Nisha Pareek', phone: '9414001012', parent_phone: '9414002012', parent_name: 'Banwari Pareek', email: 'nisha@example.com', gender: 'female', date_of_birth: '2009-11-05', admission_date: '2024-08-01', status: 'active', created_at: '2024-08-01T09:00:00Z', batches: TENTH, courses: { name: '10th Board Excellence' } },
  { id: 'stu-013', institute_id: 'demo-inst-001', batch_id: 'batch-003', course_id: 'course-003', enrollment_no: 'SHRM-0013', full_name: 'Deepak Mathur', phone: '9414001013', parent_phone: '9414002013', parent_name: 'Sunil Mathur', email: 'deepak@example.com', gender: 'male', date_of_birth: '2009-04-22', admission_date: '2024-08-01', status: 'active', created_at: '2024-08-01T11:00:00Z', batches: TENTH, courses: { name: '10th Board Excellence' } },
  { id: 'stu-014', institute_id: 'demo-inst-001', batch_id: 'batch-003', course_id: 'course-003', enrollment_no: 'SHRM-0014', full_name: 'Kavya Rajput', phone: '9414001014', parent_phone: '9414002014', parent_name: 'Bhim Singh Rajput', email: 'kavya@example.com', gender: 'female', date_of_birth: '2009-01-09', admission_date: '2024-08-05', status: 'active', created_at: '2024-08-05T09:00:00Z', batches: TENTH, courses: { name: '10th Board Excellence' } },
  { id: 'stu-015', institute_id: 'demo-inst-001', batch_id: 'batch-001', course_id: 'course-001', enrollment_no: 'SHRM-0015', full_name: 'Mohit Sharma', phone: '9414001015', parent_phone: '9414002015', parent_name: 'Sanjay Sharma', email: 'mohit@example.com', gender: 'male', date_of_birth: '2007-08-30', admission_date: '2024-08-10', status: 'active', created_at: '2024-08-10T09:00:00Z', batches: JEE, courses: { name: 'JEE Mains + Advanced' } },
]

export const DEMO_FEE_STRUCTURES = [
  { id: 'fee-str-001', institute_id: 'demo-inst-001', course_id: 'course-001', name: 'JEE Annual Fee 2025-26', total_amount: 72000, base_amount: 61017, gst_amount: 10983, gst_rate: 18, installments: 4 },
  { id: 'fee-str-002', institute_id: 'demo-inst-001', course_id: 'course-002', name: 'NEET Annual Fee 2025-26', total_amount: 68000, base_amount: 57627, gst_amount: 10373, gst_rate: 18, installments: 4 },
  { id: 'fee-str-003', institute_id: 'demo-inst-001', course_id: 'course-003', name: '10th Board Annual Fee 2025-26', total_amount: 36000, base_amount: 30508, gst_amount: 5492, gst_rate: 18, installments: 2 },
]

export const DEMO_FEE_RECORDS = [
  { id: 'fee-rec-001', student_id: 'stu-001', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-001', total_amount: 72000, amount_paid: 72000, due_date: '2025-03-31', status: 'paid' },
  { id: 'fee-rec-002', student_id: 'stu-002', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-001', total_amount: 72000, amount_paid: 54000, due_date: '2025-03-31', status: 'partial' },
  { id: 'fee-rec-003', student_id: 'stu-003', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-001', total_amount: 72000, amount_paid: 72000, due_date: '2025-03-31', status: 'paid' },
  { id: 'fee-rec-004', student_id: 'stu-004', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-001', total_amount: 72000, amount_paid: 0, due_date: '2025-02-28', status: 'overdue' },
  { id: 'fee-rec-005', student_id: 'stu-005', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-001', total_amount: 72000, amount_paid: 36000, due_date: '2025-03-31', status: 'partial' },
  { id: 'fee-rec-006', student_id: 'stu-006', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-002', total_amount: 68000, amount_paid: 68000, due_date: '2025-03-31', status: 'paid' },
  { id: 'fee-rec-007', student_id: 'stu-007', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-002', total_amount: 68000, amount_paid: 34000, due_date: '2025-03-31', status: 'partial' },
  { id: 'fee-rec-008', student_id: 'stu-008', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-002', total_amount: 68000, amount_paid: 68000, due_date: '2025-03-31', status: 'paid' },
  { id: 'fee-rec-009', student_id: 'stu-009', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-002', total_amount: 68000, amount_paid: 0, due_date: '2025-02-15', status: 'overdue' },
  { id: 'fee-rec-010', student_id: 'stu-010', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-003', total_amount: 36000, amount_paid: 36000, due_date: '2025-03-31', status: 'paid' },
  { id: 'fee-rec-011', student_id: 'stu-011', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-003', total_amount: 36000, amount_paid: 18000, due_date: '2025-03-31', status: 'partial' },
  { id: 'fee-rec-012', student_id: 'stu-012', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-003', total_amount: 36000, amount_paid: 36000, due_date: '2025-03-31', status: 'paid' },
  { id: 'fee-rec-013', student_id: 'stu-013', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-003', total_amount: 36000, amount_paid: 36000, due_date: '2025-03-31', status: 'paid' },
  { id: 'fee-rec-014', student_id: 'stu-014', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-003', total_amount: 36000, amount_paid: 18000, due_date: '2025-03-31', status: 'partial' },
  { id: 'fee-rec-015', student_id: 'stu-015', institute_id: 'demo-inst-001', fee_structure_id: 'fee-str-001', total_amount: 72000, amount_paid: 72000, due_date: '2025-03-31', status: 'paid' },
]

export const DEMO_PAYMENT_TRANSACTIONS = [
  { id: 'pay-001', fee_record_id: 'fee-rec-001', institute_id: 'demo-inst-001', amount: 18000, payment_method: 'upi', payment_date: '2024-07-05T10:30:00Z', receipt_number: 'RCP-0001', status: 'completed' },
  { id: 'pay-002', fee_record_id: 'fee-rec-001', institute_id: 'demo-inst-001', amount: 18000, payment_method: 'upi', payment_date: '2024-09-05T11:00:00Z', receipt_number: 'RCP-0002', status: 'completed' },
  { id: 'pay-003', fee_record_id: 'fee-rec-001', institute_id: 'demo-inst-001', amount: 18000, payment_method: 'cash', payment_date: '2024-11-05T09:45:00Z', receipt_number: 'RCP-0003', status: 'completed' },
  { id: 'pay-004', fee_record_id: 'fee-rec-001', institute_id: 'demo-inst-001', amount: 18000, payment_method: 'upi', payment_date: '2025-01-05T10:00:00Z', receipt_number: 'RCP-0004', status: 'completed' },
  { id: 'pay-005', fee_record_id: 'fee-rec-002', institute_id: 'demo-inst-001', amount: 18000, payment_method: 'cash', payment_date: '2024-07-08T14:00:00Z', receipt_number: 'RCP-0005', status: 'completed' },
  { id: 'pay-006', fee_record_id: 'fee-rec-002', institute_id: 'demo-inst-001', amount: 18000, payment_method: 'upi', payment_date: '2024-09-08T10:30:00Z', receipt_number: 'RCP-0006', status: 'completed' },
  { id: 'pay-007', fee_record_id: 'fee-rec-002', institute_id: 'demo-inst-001', amount: 18000, payment_method: 'bank_transfer', payment_date: '2024-11-08T15:00:00Z', receipt_number: 'RCP-0007', status: 'completed' },
  { id: 'pay-008', fee_record_id: 'fee-rec-006', institute_id: 'demo-inst-001', amount: 34000, payment_method: 'razorpay', payment_date: '2024-07-10T12:00:00Z', receipt_number: 'RCP-0008', status: 'completed' },
  { id: 'pay-009', fee_record_id: 'fee-rec-006', institute_id: 'demo-inst-001', amount: 34000, payment_method: 'razorpay', payment_date: '2024-10-10T12:00:00Z', receipt_number: 'RCP-0009', status: 'completed' },
]

// Generate 30 days of attendance sessions
function generateAttendanceSessions() {
  const sessions: Array<{ id: string; institute_id: string; batch_id: string; session_date: string; qr_token: null; qr_expires_at: null }> = []
  const today = new Date('2026-05-11')
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dow = d.getDay()
    if (dow === 0) continue // skip Sunday
    sessions.push({ id: `sess-b1-${dateStr}`, institute_id: 'demo-inst-001', batch_id: 'batch-001', session_date: dateStr, qr_token: null, qr_expires_at: null })
    sessions.push({ id: `sess-b2-${dateStr}`, institute_id: 'demo-inst-001', batch_id: 'batch-002', session_date: dateStr, qr_token: null, qr_expires_at: null })
    sessions.push({ id: `sess-b3-${dateStr}`, institute_id: 'demo-inst-001', batch_id: 'batch-003', session_date: dateStr, qr_token: null, qr_expires_at: null })
  }
  return sessions
}

export const DEMO_ATTENDANCE_SESSIONS = generateAttendanceSessions()

// Attendance per student — realistic ~82% average
function generateAttendanceRecords() {
  const records: Array<{ student_id: string; session_id: string; status: string; institute_id: string }> = []
  const batchStudents: Record<string, string[]> = {
    'batch-001': ['stu-001', 'stu-002', 'stu-003', 'stu-004', 'stu-005', 'stu-015'],
    'batch-002': ['stu-006', 'stu-007', 'stu-008', 'stu-009'],
    'batch-003': ['stu-010', 'stu-011', 'stu-012', 'stu-013', 'stu-014'],
  }
  // Absence pattern: stu-004 has 3 consecutive absences (at-risk)
  const absentSessions = new Set(['sess-b1-2026-05-06', 'sess-b1-2026-05-07', 'sess-b1-2026-05-08'])

  for (const session of DEMO_ATTENDANCE_SESSIONS) {
    const batchId = session.batch_id
    const students = batchStudents[batchId] || []
    for (const studentId of students) {
      let status = 'present'
      if (studentId === 'stu-004' && absentSessions.has(session.id)) {
        status = 'absent'
      } else if (studentId === 'stu-009' && Math.random() < 0.35) {
        status = 'absent'
      } else if (Math.random() < 0.12) {
        status = Math.random() < 0.3 ? 'late' : 'absent'
      }
      records.push({ student_id: studentId, session_id: session.id, status, institute_id: 'demo-inst-001' })
    }
  }
  return records
}

export const DEMO_ATTENDANCE_RECORDS = generateAttendanceRecords()

export const DEMO_TESTS = [
  { id: 'test-001', institute_id: 'demo-inst-001', batch_id: 'batch-001', name: 'Physics Unit Test 1', test_type: 'unit', test_date: '2025-08-20', max_marks: 100, subjects: ['Physics'] },
  { id: 'test-002', institute_id: 'demo-inst-001', batch_id: 'batch-001', name: 'Chemistry Mock 1', test_type: 'mock', test_date: '2025-09-15', max_marks: 100, subjects: ['Chemistry'] },
  { id: 'test-003', institute_id: 'demo-inst-001', batch_id: 'batch-001', name: 'JEE Half Yearly', test_type: 'half_yearly', test_date: '2025-11-10', max_marks: 300, subjects: ['Physics', 'Chemistry', 'Maths'] },
  { id: 'test-004', institute_id: 'demo-inst-001', batch_id: 'batch-002', name: 'Biology Unit Test 1', test_type: 'unit', test_date: '2025-08-25', max_marks: 90, subjects: ['Biology'] },
  { id: 'test-005', institute_id: 'demo-inst-001', batch_id: 'batch-003', name: '10th Maths Weekly', test_type: 'weekly', test_date: '2025-09-05', max_marks: 50, subjects: ['Maths'] },
]

export const DEMO_TEST_SCORES = [
  // test-001 scores
  { test_id: 'test-001', student_id: 'stu-001', marks_obtained: 88, max_marks: 100, rank_in_batch: 1, percentile: 99, is_absent: false },
  { test_id: 'test-001', student_id: 'stu-002', marks_obtained: 82, max_marks: 100, rank_in_batch: 2, percentile: 95, is_absent: false },
  { test_id: 'test-001', student_id: 'stu-003', marks_obtained: 75, max_marks: 100, rank_in_batch: 3, percentile: 88, is_absent: false },
  { test_id: 'test-001', student_id: 'stu-004', marks_obtained: 45, max_marks: 100, rank_in_batch: 5, percentile: 40, is_absent: false },
  { test_id: 'test-001', student_id: 'stu-005', marks_obtained: 68, max_marks: 100, rank_in_batch: 4, percentile: 72, is_absent: false },
  { test_id: 'test-001', student_id: 'stu-015', marks_obtained: 91, max_marks: 100, rank_in_batch: 1, percentile: 99.5, is_absent: false },
  // test-003 scores
  { test_id: 'test-003', student_id: 'stu-001', marks_obtained: 248, max_marks: 300, rank_in_batch: 2, percentile: 96, is_absent: false },
  { test_id: 'test-003', student_id: 'stu-002', marks_obtained: 211, max_marks: 300, rank_in_batch: 3, percentile: 88, is_absent: false },
  { test_id: 'test-003', student_id: 'stu-003', marks_obtained: 195, max_marks: 300, rank_in_batch: 4, percentile: 80, is_absent: false },
  { test_id: 'test-003', student_id: 'stu-004', marks_obtained: 112, max_marks: 300, rank_in_batch: 6, percentile: 35, is_absent: false },
  { test_id: 'test-003', student_id: 'stu-005', marks_obtained: 178, max_marks: 300, rank_in_batch: 5, percentile: 65, is_absent: false },
  { test_id: 'test-003', student_id: 'stu-015', marks_obtained: 267, max_marks: 300, rank_in_batch: 1, percentile: 99, is_absent: false },
]

export const DEMO_STAFF = [
  { id: 'staff-001', institute_id: 'demo-inst-001', full_name: 'Dinesh Kumar Sharma', role: 'teacher', phone: '9414100001', email: 'dinesh@sharmaclasses.in', salary_type: 'monthly', base_salary: 35000, joining_date: '2024-06-01', status: 'active' },
  { id: 'staff-002', institute_id: 'demo-inst-001', full_name: 'Rekha Vyas', role: 'teacher', phone: '9414100002', email: 'rekha@sharmaclasses.in', salary_type: 'monthly', base_salary: 28000, joining_date: '2024-06-01', status: 'active' },
  { id: 'staff-003', institute_id: 'demo-inst-001', full_name: 'Sunil Rathi', role: 'admin', phone: '9414100003', email: 'sunil@sharmaclasses.in', salary_type: 'monthly', base_salary: 22000, joining_date: '2024-06-15', status: 'active' },
  { id: 'staff-004', institute_id: 'demo-inst-001', full_name: 'Kavita Acharya', role: 'accountant', phone: '9414100004', email: 'kavita@sharmaclasses.in', salary_type: 'monthly', base_salary: 18000, joining_date: '2024-07-01', status: 'active' },
]

export const DEMO_WHATSAPP_MESSAGES = [
  { id: 'wa-001', institute_id: 'demo-inst-001', student_id: 'stu-004', message_type: 'attendance_alert', content: 'Dear parent, your child Sneha Gupta has been absent for 3 consecutive classes. Please contact Sharma Classes at 9414100003 for more information.', to_number: '919414002004', status: 'delivered', wa_message_id: 'wamid.demo001', created_at: '2026-05-09T07:30:00Z' },
  { id: 'wa-002', institute_id: 'demo-inst-001', student_id: 'stu-002', message_type: 'fee_reminder', content: 'Dear Priya, your fee of ₹18,000 for JEE Mains + Advanced is due on 31-Mar-2025. Please contact us at 9414100003 to pay.', to_number: '919414002002', status: 'delivered', wa_message_id: 'wamid.demo002', created_at: '2026-03-15T09:00:00Z' },
  { id: 'wa-003', institute_id: 'demo-inst-001', student_id: 'stu-015', message_type: 'test_result', content: 'Mohit Sharma scored 267/300 (89%) in JEE Half Yearly. Rank: 1 in batch. — Sharma Classes', to_number: '919414002015', status: 'delivered', wa_message_id: 'wamid.demo003', created_at: '2025-11-12T08:00:00Z' },
  { id: 'wa-004', institute_id: 'demo-inst-001', student_id: null, message_type: 'broadcast', content: 'Dear students and parents, PTM (Parent-Teacher Meeting) is scheduled for 15th May 2026 at 10:00 AM. Your presence is important. — Sharma Classes', to_number: 'broadcast', status: 'sent', wa_message_id: 'wamid.demo004', created_at: '2026-05-10T10:00:00Z' },
  { id: 'wa-005', institute_id: 'demo-inst-001', student_id: 'stu-009', message_type: 'attendance_alert', content: 'Dear parent, your child Rahul Verma has been absent for 3 consecutive classes. Please contact Sharma Classes at 9414100003 for more information.', to_number: '919414002009', status: 'delivered', wa_message_id: 'wamid.demo005', created_at: '2026-04-22T07:30:00Z' },
]

export const DEMO_SUBSCRIPTION = {
  institute_id: 'demo-inst-001',
  plan_tier: 'pro',
  status: 'active',
  razorpay_subscription_id: 'sub_demo_123',
  current_period_end: '2027-06-01T00:00:00Z',
}

// Monthly revenue data for the bar chart (last 6 months)
export const DEMO_MONTHLY_REVENUE = [
  { month: 'Dec', amount: 142000 },
  { month: 'Jan', amount: 198000 },
  { month: 'Feb', amount: 115000 },
  { month: 'Mar', amount: 224000 },
  { month: 'Apr', amount: 185000 },
  { month: 'May', amount: 97000 },
]

// Attendance trend data (last 30 days, Mon–Sat)
export function getDemoAttendanceTrend(): Array<{ date: string; pct: number }> {
  const trend: Array<{ date: string; pct: number }> = []
  const today = new Date('2026-05-11')
  const pcts = [85, 88, 80, 92, 87, 79, 90, 85, 88, 82, 91, 86, 84, 78, 89, 93, 87, 80, 85, 88, 76, 91, 84, 87, 90, 82, 88, 84, 92, 86]
  let pctIdx = 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (d.getDay() === 0) continue
    const label = `${d.getDate()}/${d.getMonth() + 1}`
    trend.push({ date: label, pct: pcts[pctIdx % pcts.length] })
    pctIdx++
  }
  return trend
}
