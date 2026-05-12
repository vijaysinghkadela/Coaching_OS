export const TIER_LIMITS = {
  starter: { maxStudents: 100, label: 'Starter', price: 999 },
  growth:  { maxStudents: 300, label: 'Growth',  price: 1999 },
  pro:     { maxStudents: Infinity, label: 'Pro', price: 3499 },
} as const

export type PlanTier = keyof typeof TIER_LIMITS

export const TIER_FEATURES = {
  starter: ['Attendance tracking', 'Fee management', 'Basic reports', 'Up to 100 students'],
  growth:  ['Everything in Starter', 'Test tracking', 'WhatsApp alerts', 'Parent reports', 'Up to 300 students'],
  pro:     ['Everything in Growth', 'AI parent reports', 'Performance prediction', 'Staff management', 'Unlimited students'],
}

export const GST_RATE = 0       // Education services: 0% GST
export const GST_RATE_WITH = 18 // For non-education services if needed

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const SHORT_DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
]

export const TEST_TYPES = [
  { value: 'unit',        label: 'Unit Test' },
  { value: 'chapter',     label: 'Chapter Test' },
  { value: 'mock',        label: 'Mock Test' },
  { value: 'half_yearly', label: 'Half Yearly' },
  { value: 'annual',      label: 'Annual Exam' },
  { value: 'jee_mock',    label: 'JEE Mock' },
  { value: 'neet_mock',   label: 'NEET Mock' },
] as const

export const LEAVE_TYPES = [
  { value: 'casual', label: 'Casual Leave' },
  { value: 'sick',   label: 'Sick Leave' },
  { value: 'earned', label: 'Earned Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
]

export const PAYMENT_MODES = [
  { value: 'cash',     label: 'Cash' },
  { value: 'upi',      label: 'UPI' },
  { value: 'razorpay', label: 'Online (Razorpay)' },
  { value: 'cheque',   label: 'Cheque' },
  { value: 'neft',     label: 'NEFT/Bank Transfer' },
]

export const GENDER_OPTIONS = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other' },
]

export const RAJASTHAN_CITIES = [
  'Bikaner', 'Jaipur', 'Jodhpur', 'Nagaur', 'Ajmer', 'Udaipur',
  'Kota', 'Sikar', 'Alwar', 'Bharatpur', 'Sri Ganganagar', 'Hanumangarh',
]

export const COMMON_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi',
  'Social Science', 'Science', 'Computer Science', 'Sanskrit', 'History',
  'Geography', 'Political Science', 'Economics', 'Accountancy',
  'Reasoning', 'General Knowledge', 'Current Affairs',
]

export const ATTENDANCE_STATUS_COLORS = {
  present: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  absent:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  late:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  excused: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
} as const

export const FEE_STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-800',
  partial:  'bg-orange-100 text-orange-800',
  paid:     'bg-green-100 text-green-800',
  overdue:  'bg-red-100 text-red-800',
  waived:   'bg-gray-100 text-gray-800',
} as const

// At-risk thresholds
export const RISK_ATTENDANCE_THRESHOLD = 60  // % below which student is at risk
export const RISK_SCORE_THRESHOLD      = 40  // % below which student is at risk
export const CONSECUTIVE_ABSENCE_ALERT = 3   // days before WhatsApp alert fires
