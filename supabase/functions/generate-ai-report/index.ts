import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

  const { studentId } = await req.json()

  // Fetch student data
  const [studentRes, attRes, testRes] = await Promise.all([
    supabase.from('students').select('full_name, batches(name), courses(name)').eq('id', studentId).single(),
    supabase.from('attendance_records').select('status').eq('student_id', studentId).limit(60),
    supabase.from('test_scores').select('marks_obtained, max_marks, tests(name)').eq('student_id', studentId).limit(5),
  ])

  const student = studentRes.data
  if (!student) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders })

  const attRecords = attRes.data ?? []
  const present = attRecords.filter((r: { status: string }) => r.status === 'present').length
  const attPct = attRecords.length > 0 ? Math.round((present / attRecords.length) * 100) : 0
  const tests = testRes.data ?? []
  const avgScore = tests.length > 0
    ? Math.round(tests.reduce((s: number, t: { marks_obtained: number; max_marks: number }) => s + (t.max_marks > 0 ? (t.marks_obtained / t.max_marks) * 100 : 0), 0) / tests.length)
    : 0

  const prompt = `Write a 2-paragraph parent progress report for ${(student as { full_name: string }).full_name}.
Attendance: ${attPct}% · Average Score: ${avgScore}%
Recent tests: ${tests.slice(0, 3).map((t: { tests: { name: string } | null; marks_obtained: number; max_marks: number }) => `${t.tests?.name ?? 'Test'}: ${t.max_marks > 0 ? Math.round((t.marks_obtained / t.max_marks) * 100) : 0}%`).join(', ')}

Be warm, specific, and give one actionable suggestion. Do not use generic AI phrases.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const claudeData = await response.json()
  const report = claudeData.content?.[0]?.text ?? ''

  return new Response(JSON.stringify({ report }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
