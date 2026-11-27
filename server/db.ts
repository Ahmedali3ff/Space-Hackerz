// server/db.ts
// One data layer for local development and production. Production uses Turso (libSQL) when
// TURSO_DATABASE_URL is set; otherwise a local SQLite file is used.
import { createClient } from '@libsql/client'
import type { InValue, Transaction } from '@libsql/client'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const localFile =
  process.env['DB_PATH'] ?? (process.env['VERCEL'] === '1' ? '/tmp/space-plus.db' : path.join(here, '..', 'space-plus.db'))

/** True when data goes to Turso, so it survives serverless restarts. */
export const isPersistentStorage = Boolean(process.env['TURSO_DATABASE_URL'])

export const client = createClient({
  url: process.env['TURSO_DATABASE_URL'] ?? `file:${localFile}`,
  authToken: process.env['TURSO_AUTH_TOKEN'],
})

const SCHEMA: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    account_id TEXT UNIQUE,
    name TEXT NOT NULL DEFAULT 'Commander',
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    commander_title TEXT DEFAULT 'Space Cadet',
    total_stars INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS mission_progress (
    player_id TEXT NOT NULL,
    mission_id TEXT NOT NULL,
    status TEXT DEFAULT 'locked',
    tasks_complete TEXT DEFAULT '[]',
    stars_earned INTEGER DEFAULT 0,
    completed_at TEXT,
    PRIMARY KEY (player_id, mission_id)
  )`,
  `CREATE TABLE IF NOT EXISTS mission_runs (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    mission_id TEXT NOT NULL,
    planet_id TEXT NOT NULL,
    crew_size INTEGER NOT NULL,
    mission_duration_days INTEGER NOT NULL,
    days_survived INTEGER NOT NULL,
    final_score INTEGER NOT NULL,
    stars_earned INTEGER NOT NULL,
    outcome TEXT NOT NULL,
    events_resolved INTEGER DEFAULT 0,
    completed_at TEXT DEFAULT (datetime('now'))
  )`,
]

let schemaReady: Promise<void> | undefined
/** Creates the tables once per process. Every helper below waits for it. */
export function ensureSchema(): Promise<void> {
  schemaReady ??= client.batch(SCHEMA.map((sql) => ({ sql, args: [] })), 'write').then(() => undefined)
  return schemaReady
}

type Args = readonly InValue[]

function toObjects<T>(columns: readonly string[], rows: readonly ArrayLike<unknown>[]): T[] {
  return rows.map((row) => Object.fromEntries(columns.map((column, i) => [column, row[i]])) as T)
}

export async function all<T>(sql: string, args: Args = []): Promise<T[]> {
  await ensureSchema()
  const result = await client.execute({ sql, args: [...args] })
  return toObjects<T>(result.columns, result.rows)
}

export async function one<T>(sql: string, args: Args = []): Promise<T | undefined> {
  return (await all<T>(sql, args))[0]
}

export async function run(sql: string, args: Args = []): Promise<void> {
  await ensureSchema()
  await client.execute({ sql, args: [...args] })
}

/** Several writes that succeed or fail together. */
export async function batch(statements: readonly { sql: string; args?: Args }[]): Promise<void> {
  await ensureSchema()
  await client.batch(statements.map((s) => ({ sql: s.sql, args: [...(s.args ?? [])] })), 'write')
}

/** A transaction in which reads and writes depend on each other (for example, computing a reward). */
export async function withTransaction<T>(work: (t: Transaction) => Promise<T>): Promise<T> {
  await ensureSchema()
  const t = await client.transaction('write')
  try {
    const result = await work(t)
    await t.commit()
    return result
  } catch (error) {
    await t.rollback()
    throw error
  }
}

export async function txAll<T>(t: Transaction, sql: string, args: Args = []): Promise<T[]> {
  const result = await t.execute({ sql, args: [...args] })
  return toObjects<T>(result.columns, result.rows)
}
