// Mock Supabase client for demo mode — no real network calls
import {
  DEMO_USER,
  DEMO_INSTITUTE,
  DEMO_PROFILES,
  DEMO_COURSES,
  DEMO_ROOMS,
  DEMO_BATCHES,
  DEMO_STUDENTS,
  DEMO_FEE_STRUCTURES,
  DEMO_FEE_RECORDS,
  DEMO_PAYMENT_TRANSACTIONS,
  DEMO_ATTENDANCE_SESSIONS,
  DEMO_ATTENDANCE_RECORDS,
  DEMO_TESTS,
  DEMO_TEST_SCORES,
  DEMO_STAFF,
  DEMO_WHATSAPP_MESSAGES,
  DEMO_SUBSCRIPTION,
  DEMO_MONTHLY_REVENUE,
  getDemoAttendanceTrend,
} from './data'

const TABLE_MAP: Record<string, unknown[]> = {
  institutes: [DEMO_INSTITUTE],
  profiles: DEMO_PROFILES,
  courses: DEMO_COURSES,
  rooms: DEMO_ROOMS,
  batches: DEMO_BATCHES,
  students: DEMO_STUDENTS,
  fee_structures: DEMO_FEE_STRUCTURES,
  fee_records: DEMO_FEE_RECORDS,
  payment_transactions: DEMO_PAYMENT_TRANSACTIONS,
  attendance_sessions: DEMO_ATTENDANCE_SESSIONS,
  attendance_records: DEMO_ATTENDANCE_RECORDS,
  tests: DEMO_TESTS,
  test_scores: DEMO_TEST_SCORES,
  staff: DEMO_STAFF,
  whatsapp_messages: DEMO_WHATSAPP_MESSAGES,
  saas_subscriptions: [DEMO_SUBSCRIPTION],
  ai_usage: [],
}

type Result<T> = { data: T; error: null; count?: number }
type ErrResult = { data: null; error: { message: string } }

class QueryBuilder<T = Record<string, unknown>> {
  private _data: T[]
  private _single = false
  private _limit?: number
  private _range?: [number, number]
  private _filters: Array<(row: T) => boolean> = []

  constructor(data: T[]) {
    this._data = data
  }

  // Filter methods — most just return `this` for chaining
  eq(col: string, val: unknown) {
    this._filters.push((row) => (row as Record<string, unknown>)[col] === val)
    return this
  }
  neq(_col: string, _val: unknown) { return this }
  gt(_col: string, _val: unknown) { return this }
  gte(_col: string, _val: unknown) { return this }
  lt(_col: string, _val: unknown) { return this }
  lte(_col: string, _val: unknown) { return this }
  like(_col: string, _val: unknown) { return this }
  ilike(_col: string, _val: unknown) { return this }
  in(_col: string, _vals: unknown[]) { return this }
  is(_col: string, _val: unknown) { return this }
  not(_col: string, _op: string, _val: unknown) { return this }
  contains(_col: string, _val: unknown) { return this }
  overlaps(_col: string, _val: unknown) { return this }
  filter(_col: string, _op: string, _val: unknown) { return this }
  match(_obj: Record<string, unknown>) { return this }

  order(_col: string, _opts?: { ascending?: boolean }) { return this }
  select(_cols?: string) { return this }
  insert(_data: unknown) { return this }
  upsert(_data: unknown, _opts?: unknown) { return this }
  update(_data: unknown) { return this }
  delete() { return this }

  limit(n: number) {
    this._limit = n
    return this
  }

  range(from: number, to: number) {
    this._range = [from, to]
    return this
  }

  single() {
    this._single = true
    return this as unknown as Promise<Result<T | null> | ErrResult>
  }

  maybeSingle() {
    this._single = true
    return this as unknown as Promise<Result<T | null>>
  }

  private resolve(): T[] {
    let rows = this._data
    for (const f of this._filters) {
      rows = rows.filter(f)
    }
    if (this._range) {
      rows = rows.slice(this._range[0], this._range[1] + 1)
    } else if (this._limit !== undefined) {
      rows = rows.slice(0, this._limit)
    }
    return rows
  }

  // Make it thenable so `await supabase.from(...).select(...)` works
  then<TResult>(
    onfulfilled: (value: Result<T | T[] | null>) => TResult
  ): Promise<TResult> {
    const rows = this.resolve()
    let value: Result<T | T[] | null>
    if (this._single) {
      value = { data: rows[0] ?? null, error: null }
    } else {
      value = { data: rows, error: null, count: rows.length }
    }
    return Promise.resolve(onfulfilled(value))
  }
}

function makeFrom(table: string) {
  const rows = (TABLE_MAP[table] ?? []) as Record<string, unknown>[]
  return new QueryBuilder(rows)
}

function makeRpc(fn: string, _args?: Record<string, unknown>) {
  // Return demo analytics for known RPC functions
  if (fn === 'get_today_attendance_pct') {
    return Promise.resolve({ data: 84.7, error: null })
  }
  if (fn === 'get_at_risk_students') {
    return Promise.resolve({
      data: [
        { student_id: 'stu-004', full_name: 'Sneha Gupta', enrollment_no: 'SHRM-0004', batch_name: 'JEE 2026 Morning', att_pct: 42, avg_score_pct: 40 },
        { student_id: 'stu-009', full_name: 'Rahul Verma', enrollment_no: 'SHRM-0009', batch_name: 'NEET 2026 Batch A', att_pct: 55, avg_score_pct: 38 },
      ],
      error: null,
    })
  }
  if (fn === 'get_revenue_by_month') {
    return Promise.resolve({ data: DEMO_MONTHLY_REVENUE, error: null })
  }
  if (fn === 'get_attendance_trend') {
    return Promise.resolve({ data: getDemoAttendanceTrend(), error: null })
  }
  if (fn === 'trigger_absence_alerts') {
    return Promise.resolve({ data: null, error: null })
  }
  if (fn === 'recompute_test_ranks') {
    return Promise.resolve({ data: null, error: null })
  }
  return Promise.resolve({ data: null, error: null })
}

const demoAuth = {
  getUser: () => Promise.resolve({ data: { user: DEMO_USER }, error: null }),
  getSession: () => Promise.resolve({ data: { session: { user: DEMO_USER, access_token: 'demo_token' } }, error: null }),
  signInWithPassword: (_c: unknown) => Promise.resolve({ data: { user: DEMO_USER }, error: null }),
  signUp: (_c: unknown) => Promise.resolve({ data: { user: DEMO_USER }, error: null }),
  signOut: () => Promise.resolve({ error: null }),
  onAuthStateChange: (_cb: unknown) => ({ data: { subscription: { unsubscribe: () => {} } } }),
}

const demoStorage = {
  from: (_bucket: string) => ({
    upload: (_path: string, _file: unknown) => Promise.resolve({ data: { path: 'demo/file.jpg' }, error: null }),
    getPublicUrl: (_path: string) => ({ data: { publicUrl: 'https://placehold.co/400x400?text=Demo' } }),
    remove: (_paths: string[]) => Promise.resolve({ data: [], error: null }),
  }),
}

export function createDemoClient() {
  return {
    from: (table: string) => makeFrom(table),
    rpc: (fn: string, args?: Record<string, unknown>) => makeRpc(fn, args),
    auth: demoAuth,
    storage: demoStorage,
    channel: (_name: string) => ({
      on: (_event: string, _filter: unknown, _cb: unknown) => ({ subscribe: () => {} }),
      subscribe: () => {},
    }),
    removeChannel: (_ch: unknown) => {},
  }
}
