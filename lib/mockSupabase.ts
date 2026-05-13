// Mock Supabase client for when Supabase is not configured
/* eslint-disable no-unused-vars */
import { createDemoClient } from '@/lib/demo/client'

// We'll use the demo client but with empty tables for non-demo mode
// This is a simplified mock that returns empty data for all queries
const EMPTY_TABLE_MAP: Record<string, unknown[]> = {
  institutes: [],
  profiles: [],
  courses: [],
  rooms: [],
  batches: [],
  students: [],
  fee_structures: [],
  fee_records: [],
  payment_transactions: [],
  attendance_sessions: [],
  attendance_records: [],
  tests: [],
  test_scores: [],
  staff: [],
  whatsapp_messages: [],
  saas_subscriptions: [],
  ai_usage: [],
}

type Result<T> = { data: T; error: null; count?: number }
type ErrResult = { data: null; error: { message: string } }

class MockQueryBuilder<T = Record<string, unknown>> {
  private _data: T[]
  private _single = false
  private _limit?: number
  private _range?: [number, number]
  private _filters: Array<(row: T) => boolean> = []

  constructor(data: T[]) {
    this._data = data
  }

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
  const rows = (EMPTY_TABLE_MAP[table] ?? []) as Record<string, unknown>[]
  return new MockQueryBuilder(rows)
}

function makeRpc(fn: string, _args?: Record<string, unknown>) {
  // Return empty data for all RPC functions
  return Promise.resolve({ data: null, error: null })
}

const mockAuth = {
  getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  signInWithPassword: (_c: unknown) => Promise.resolve({ data: { user: null }, error: null }),
  signUp: (_c: unknown) => Promise.resolve({ data: { user: null }, error: null }),
  signOut: () => Promise.resolve({ error: null }),
  onAuthStateChange: (_cb: unknown) => ({ data: { subscription: { unsubscribe: () => {} } } }),
}

const mockStorage = {
  from: (_bucket: string) => ({
    upload: (_path: string, _file: unknown) => Promise.resolve({ data: { path: '' }, error: null }),
    getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
    remove: (_paths: string[]) => Promise.resolve({ data: [], error: null }),
  }),
}

export function createMockClient() {
  return {
    from: (table: string) => makeFrom(table),
    rpc: (fn: string, args?: Record<string, unknown>) => makeRpc(fn, args),
    auth: mockAuth,
    storage: mockStorage,
    channel: (_name: string) => ({
      on: (_event: string, _filter: unknown, _cb: unknown) => ({ subscribe: () => {} }),
      subscribe: () => {},
    }),
    removeChannel: (_ch: unknown) => {},
  }
}