import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { DEMO_STUDENTS } from '@/lib/demo/data'

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

const DEMO_REPORTS: Record<string, string> = {
  'stu-001': `It is a pleasure to share Arjun Mehta's progress report for the JEE 2026 Morning batch at Sharma Classes. Arjun has demonstrated outstanding consistency this term, maintaining an attendance rate of 91% and securing Rank 1 in Physics Unit Test 1 with 88 marks out of 100. His performance in the JEE Half Yearly exam was equally impressive — 248 out of 300, placing him second in his batch — which reflects both his conceptual clarity and his disciplined study approach.

There are, however, opportunities for further improvement. While Arjun excels in Physics, his Chemistry scores show room for growth. We encourage him to allocate an additional 30 minutes daily to Organic Chemistry reaction mechanisms, which tend to carry significant weightage in JEE Advanced. Consistent practice of previous years' questions in this area will meaningfully improve his overall percentile.

As a parent, we recommend establishing a fixed revision window after Arjun returns home each evening — even 20-30 minutes reviewing the day's coaching notes makes a significant cumulative difference over a 24-week preparation cycle. Arjun has strong fundamentals; sustained effort and targeted revision will make him a competitive JEE candidate.`,

  'stu-002': `Priya Sharma has shown commendable dedication throughout this term in the JEE 2026 Morning batch. With an attendance rate of 88% and consistent participation, she has built a solid foundation across all three subjects. Her JEE Half Yearly score of 211 out of 300 places her third in the batch, reflecting steady progress and a genuine commitment to improvement since the first unit tests.

One area where focused effort will pay dividends is Mathematics — specifically coordinate geometry and integral calculus. Priya's strong work ethic means she is well-positioned to bridge this gap with targeted practice sets. We recommend she attempt at least 15 problems per topic each week from a structured question bank rather than re-reading theory.

Parents can support Priya best by ensuring she gets 7-8 hours of sleep nightly — a factor often underestimated in competitive exam preparation. A well-rested mind retains and applies concepts significantly more effectively during mock tests and the actual examination.`,

  default: `It is a pleasure to share this student's progress report from Sharma Classes. The student has shown consistent attendance and genuine engagement with the curriculum throughout this term. Their performance in recent assessments reflects a solid foundational understanding of the core subjects.

We have identified specific areas where targeted revision will yield measurable improvement in the coming weeks. Our teaching faculty will provide additional practice sets and one-on-one guidance during doubt sessions to address these gaps effectively.

We encourage parents to maintain open communication with the student about their daily study routine at home. A structured 2-hour self-study window after coaching, focused on solving problems rather than reading notes, will accelerate their preparation significantly. Please feel free to contact us directly to discuss your child's progress in detail.`,
}

export async function POST(request: Request) {
  const { studentId } = await request.json()

  // Demo mode — return pre-written realistic report
  if (IS_DEMO) {
    await new Promise((r) => setTimeout(r, 1800)) // realistic generation delay
    const report = DEMO_REPORTS[studentId] ?? DEMO_REPORTS['default']
    const student = DEMO_STUDENTS.find((s) => s.id === studentId)
    const name = student?.full_name ?? 'this student'
    return NextResponse.json({
      report: report.replace('this student', name),
    })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: institute } = await supabase
    .from('institutes')
    .select('id, plan_tier, name')
    .eq('owner_id', user.id)
    .single()

  if (!institute || institute.plan_tier !== 'pro') {
    return NextResponse.json({ error: 'Pro plan required for AI features' }, { status: 403 })
  }

  const [studentRes, attendanceRes, testRes, feeRes] = await Promise.all([
    supabase.from('students').select('full_name, enrollment_no, batches(name), courses(name)').eq('id', studentId).single(),
    supabase.from('attendance_records').select('status, attendance_sessions(session_date)').eq('student_id', studentId).limit(60),
    supabase.from('test_scores').select('marks_obtained, max_marks, percentile, rank_in_batch, tests(name, test_type, test_date)').eq('student_id', studentId).limit(10),
    supabase.from('fee_records').select('total_amount, amount_paid, status').eq('student_id', studentId),
  ])

  const student = studentRes.data
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const attRecords = attendanceRes.data ?? []
  const present = attRecords.filter((r) => r.status === 'present' || r.status === 'late').length
  const attPct = attRecords.length > 0 ? Math.round((present / attRecords.length) * 100) : 0

  const tests = testRes.data ?? []
  const avgMarks = tests.length > 0 ? tests.reduce((s, t) => s + (t.max_marks > 0 ? (t.marks_obtained / t.max_marks) * 100 : 0), 0) / tests.length : 0

  const fees = feeRes.data ?? []
  const feeStatus = fees.every((f) => f.status === 'paid') ? 'all fees paid' : fees.some((f) => f.status === 'overdue') ? 'has overdue fees' : 'partially paid fees'

  const batch = (student.batches as unknown as { name: string }[] | null)?.[0]?.name ?? 'their batch'
  const course = (student.courses as unknown as { name: string }[] | null)?.[0]?.name ?? 'the course'

  const prompt = `Write a concise, warm parent progress report for ${student.full_name} enrolled in ${batch} (${course}) at ${institute.name}.

Student Data:
- Attendance: ${attPct}% (${present}/${attRecords.length} sessions attended)
- Average Test Score: ${Math.round(avgMarks)}% across ${tests.length} tests
- Recent Tests: ${tests.slice(0, 3).map((t) => {
  const test = (t.tests as unknown as { name: string; test_type: string }[] | null)?.[0] ?? null
  const pct = t.max_marks > 0 ? Math.round((t.marks_obtained / t.max_marks) * 100) : 0
  return `${test?.name ?? 'Test'}: ${pct}% (Rank #${t.rank_in_batch ?? 'N/A'})`
}).join(', ')}
- Fee Status: ${feeStatus}

Write 2-3 paragraphs that:
1. Acknowledge strengths positively
2. Highlight areas for improvement (diplomatically)
3. Give one actionable suggestion for the parent

Write in a professional but warm tone. Do not use generic AI phrases. Be specific to the data provided.`

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  const report = (response.content[0] as { type: string; text: string }).text

  await supabase.from('ai_usage').insert({
    institute_id: institute.id,
    feature: 'parent_report',
    student_id: studentId,
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    cost_usd: (response.usage.input_tokens * 0.000003) + (response.usage.output_tokens * 0.000015),
  })

  return NextResponse.json({ report })
}
