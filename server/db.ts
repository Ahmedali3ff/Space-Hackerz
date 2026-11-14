import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', 'space-plus.db')
export const db = new Database(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    account_id TEXT UNIQUE,
    name TEXT NOT NULL DEFAULT 'Commander',
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    commander_title TEXT DEFAULT 'Space Cadet',
    total_stars INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS mission_progress (
    player_id TEXT NOT NULL DEFAULT 'player-1',
    mission_id TEXT NOT NULL,
    status TEXT DEFAULT 'locked',
    tasks_complete TEXT DEFAULT '[]',
    stars_earned INTEGER DEFAULT 0,
    completed_at TEXT,
    PRIMARY KEY (player_id, mission_id)
  );

  CREATE TABLE IF NOT EXISTS mission_runs (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL DEFAULT 'player-1',
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
  );
`)

try { db.exec('ALTER TABLE players ADD COLUMN account_id TEXT') } catch { /* column already exists */ }
