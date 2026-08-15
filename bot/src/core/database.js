// bot/src/core/database.js
//
// SQLite (better-sqlite3) data layer. Every other module talks to the
// database ONLY through the functions exported here — no module
// reaches into another module's tables directly, and no module opens
// its own database connection. This is what keeps modules swappable.

import Database from "better-sqlite3";
import { mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { config } from "./config.js";
import { getLogger } from "./logger.js";

const logger = getLogger("database");

let db = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS members (
  discord_id TEXT PRIMARY KEY,
  username TEXT,
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  verified_at TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_active_at TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  actor_id TEXT,
  target_id TEXT,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS moderation_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  member_id TEXT,
  channel_id TEXT,
  rule_name TEXT,
  content_snippet TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Recurring events (Sunday meeting, quizzes, challenges, announcements).
-- NOTHING about schedule is hardcoded in source — every row here is
-- fully created/edited/postponed/cancelled/resumed via slash commands
-- by Owner/Admin, at runtime, with zero redeploy required.
CREATE TABLE IF NOT EXISTS recurring_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_key TEXT NOT NULL UNIQUE,       -- short slug, e.g. "sunday-meeting"
  title TEXT NOT NULL,
  description TEXT,
  channel_id TEXT NOT NULL,
  event_type TEXT NOT NULL,             -- 'meeting' | 'quiz' | 'challenge' | 'announcement' | 'custom'
  recurrence_rule TEXT NOT NULL,        -- 'daily' | 'weekly' | 'monthly' | 'once'
  recurrence_day TEXT,                  -- for weekly: 'SUNDAY' etc. For monthly: day-of-month number as text.
  recurrence_time_utc TEXT NOT NULL,    -- 'HH:MM' 24h UTC (converted from IST at creation time)
  status TEXT NOT NULL DEFAULT 'active',-- 'active' | 'postponed' | 'cancelled' | 'disabled'
  postponed_until TEXT,                 -- ISO datetime, only set when status = 'postponed'
  next_run_at TEXT,                     -- ISO datetime, computed and updated by the scheduler
  last_run_at TEXT,
  quiz_subject TEXT,                    -- only used when event_type = 'quiz'; null = any subject
  quiz_class TEXT,                      -- only used when event_type = 'quiz'; null = any class
  quiz_count INTEGER,                   -- only used when event_type = 'quiz'; null = mode default
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Quiz attempts: one row per question a member has ever answered,
-- across all modes (practice, daily, weekly, monthly, community).
-- This is what powers repeat-avoidance in randomizer.js and will
-- power XP/scoring once Phase 2's XP system is built.
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  quiz_mode TEXT NOT NULL,       -- 'practice' | 'daily' | 'weekly' | 'monthly' | 'community'
  subject TEXT,
  class TEXT,
  was_correct INTEGER NOT NULL,  -- 0 or 1
  answered_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_member ON quiz_attempts(member_id, answered_at);

-- Community quiz posts (daily/weekly/monthly quizzes fired by the
-- Event Management module into a shared channel): tracks which
-- message maps to which question so button clicks can be resolved,
-- and enforces one answer per member per question.
CREATE TABLE IF NOT EXISTS community_quiz_answers (
  message_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  was_correct INTEGER NOT NULL,
  answered_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (message_id, member_id)
);

-- Chapter completions: one row per member per class they've PASSED a
-- Chapter Assessment or Final Examination for. This is what gates
-- curriculum progression. Unlimited retries are allowed — this table
-- only ever records passing attempts; failed attempts aren't blocked
-- from retrying and don't need their own row here.
CREATE TABLE IF NOT EXISTS class_completions (
  member_id TEXT NOT NULL,
  class TEXT NOT NULL,
  best_score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (member_id, class)
);
`;

/**
 * Initialize the database connection and ensure schema exists.
 * Safe to call multiple times (idempotent).
 */
export function initDatabase() {
  if (db) return db;

  const path = config.database.path;
  const dir = dirname(path);
  if (dir && dir !== "." && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);

  logger.info({ path }, "Database initialized");
  return db;
}

function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() before using repository functions.");
  }
  return db;
}

// ── Config key-value store ──────────────────────────────────────────
// Used to persist server-specific data discovered/created at runtime
// (channel IDs, role IDs) so they never need to be hand-typed into
// .env. Keys are namespaced, e.g. "channel.welcome", "role.verified".

export function setConfig(key, value) {
  const stmt = getDb().prepare(
    `INSERT INTO config (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  );
  stmt.run(key, String(value));
}

export function getConfigValue(key, fallback = null) {
  const row = getDb().prepare("SELECT value FROM config WHERE key = ?").get(key);
  return row ? row.value : fallback;
}

export function getAllConfig(prefix = "") {
  const rows = getDb()
    .prepare("SELECT key, value FROM config WHERE key LIKE ?")
    .all(`${prefix}%`);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

// ── Members ──────────────────────────────────────────────────────────

export function upsertMember(discordId, fields = {}) {
  const existing = getDb().prepare("SELECT discord_id FROM members WHERE discord_id = ?").get(discordId);

  if (!existing) {
    getDb()
      .prepare(
        `INSERT INTO members (discord_id, username, joined_at)
         VALUES (?, ?, datetime('now'))`
      )
      .run(discordId, fields.username || null);
    return;
  }

  const setClauses = [];
  const values = [];
  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = ?`);
    values.push(value);
  }
  if (setClauses.length === 0) return;

  values.push(discordId);
  getDb()
    .prepare(`UPDATE members SET ${setClauses.join(", ")} WHERE discord_id = ?`)
    .run(...values);
}

export function getMember(discordId) {
  return getDb().prepare("SELECT * FROM members WHERE discord_id = ?").get(discordId) || null;
}

export function markMemberVerified(discordId) {
  getDb()
    .prepare("UPDATE members SET verified_at = datetime('now') WHERE discord_id = ?")
    .run(discordId);
}

// ── Audit log ────────────────────────────────────────────────────────

export function logAudit(action, actorId, targetId = null, details = null) {
  getDb()
    .prepare(
      `INSERT INTO audit_log (action, actor_id, target_id, details) VALUES (?, ?, ?, ?)`
    )
    .run(action, actorId, targetId, details ? JSON.stringify(details) : null);
}

// ── Moderation events (AutoMod / security) ─────────────────────────

export function logModerationEvent({ eventType, memberId = null, channelId = null, ruleName = null, contentSnippet = null }) {
  getDb()
    .prepare(
      `INSERT INTO moderation_events (event_type, member_id, channel_id, rule_name, content_snippet)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(eventType, memberId, channelId, ruleName, contentSnippet);
}

// ── Recurring events ─────────────────────────────────────────────────
// Full CRUD backing the /event slash commands. This is the only place
// recurring-event data is read or written.

export function createRecurringEvent(fields) {
  const stmt = getDb().prepare(`
    INSERT INTO recurring_events
      (event_key, title, description, channel_id, event_type,
       recurrence_rule, recurrence_day, recurrence_time_utc,
       status, next_run_at, quiz_subject, quiz_class, quiz_count, created_by)
    VALUES
      (@event_key, @title, @description, @channel_id, @event_type,
       @recurrence_rule, @recurrence_day, @recurrence_time_utc,
       'active', @next_run_at, @quiz_subject, @quiz_class, @quiz_count, @created_by)
  `);
  stmt.run({
    quiz_subject: null,
    quiz_class: null,
    quiz_count: null,
    ...fields
  });
  return getRecurringEventByKey(fields.event_key);
}

export function getRecurringEventByKey(eventKey) {
  return getDb().prepare("SELECT * FROM recurring_events WHERE event_key = ?").get(eventKey) || null;
}

export function listRecurringEvents({ statusFilter = null } = {}) {
  if (statusFilter) {
    return getDb()
      .prepare("SELECT * FROM recurring_events WHERE status = ? ORDER BY next_run_at ASC")
      .all(statusFilter);
  }
  return getDb().prepare("SELECT * FROM recurring_events ORDER BY next_run_at ASC").all();
}

export function listDueRecurringEvents(nowIso) {
  return getDb()
    .prepare(
      `SELECT * FROM recurring_events
       WHERE status = 'active' AND next_run_at IS NOT NULL AND next_run_at <= ?`
    )
    .all(nowIso);
}

export function updateRecurringEvent(eventKey, fields) {
  const setClauses = [];
  const values = [];
  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = ?`);
    values.push(value);
  }
  if (setClauses.length === 0) return getRecurringEventByKey(eventKey);

  setClauses.push("updated_at = datetime('now')");
  values.push(eventKey);

  getDb()
    .prepare(`UPDATE recurring_events SET ${setClauses.join(", ")} WHERE event_key = ?`)
    .run(...values);

  return getRecurringEventByKey(eventKey);
}

export function deleteRecurringEvent(eventKey) {
  getDb().prepare("DELETE FROM recurring_events WHERE event_key = ?").run(eventKey);
}

export function countModerationEventsSince(eventType, memberId, sinceIso) {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) as count FROM moderation_events
       WHERE event_type = ? AND member_id = ? AND created_at > ?`
    )
    .get(eventType, memberId, sinceIso);
  return row ? row.count : 0;
}

export function listAuditLogEntries({ limit = 15, actionFilter = null } = {}) {
  if (actionFilter) {
    return getDb()
      .prepare("SELECT * FROM audit_log WHERE action LIKE ? ORDER BY created_at DESC LIMIT ?")
      .all(`%${actionFilter}%`, limit);
  }
  return getDb().prepare("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?").all(limit);
}

// ── Quiz attempts ────────────────────────────────────────────────────

export function recordQuizAttempt({ memberId, questionId, quizMode, subject, classKey, wasCorrect }) {
  getDb()
    .prepare(
      `INSERT INTO quiz_attempts (member_id, question_id, quiz_mode, subject, class, was_correct)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(memberId, questionId, quizMode, subject || null, classKey || null, wasCorrect ? 1 : 0);
}

export function getRecentQuestionIdsForMember(memberId, sinceDays = 7) {
  const sinceIso = new Date(Date.now() - sinceDays * 24 * 60 * 60_000).toISOString();
  const rows = getDb()
    .prepare(
      `SELECT DISTINCT question_id FROM quiz_attempts
       WHERE member_id = ? AND answered_at > ?`
    )
    .all(memberId, sinceIso);
  return rows.map((r) => r.question_id);
}

export function getMemberQuizStats(memberId) {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) as total, SUM(was_correct) as correct
       FROM quiz_attempts WHERE member_id = ?`
    )
    .get(memberId);
  return { total: row.total || 0, correct: row.correct || 0 };
}

// ── Community quiz answers (shared channel-posted quizzes) ──────────

export function recordCommunityQuizAnswer({ messageId, memberId, questionId, wasCorrect }) {
  try {
    getDb()
      .prepare(
        `INSERT INTO community_quiz_answers (message_id, member_id, question_id, was_correct)
         VALUES (?, ?, ?, ?)`
      )
      .run(messageId, memberId, questionId, wasCorrect ? 1 : 0);
    return true; // first time answering this message
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
      return false; // already answered — enforced at the DB level, not just in application code
    }
    throw err;
  }
}

// ── Chapter/curriculum progress ─────────────────────────────────────

export function recordClassCompletion({ memberId, classKey, score, totalQuestions }) {
  const existing = getDb()
    .prepare("SELECT * FROM class_completions WHERE member_id = ? AND class = ?")
    .get(memberId, classKey);

  if (!existing) {
    getDb()
      .prepare(
        `INSERT INTO class_completions (member_id, class, best_score, total_questions, attempts)
         VALUES (?, ?, ?, ?, 1)`
      )
      .run(memberId, classKey, score, totalQuestions);
    return;
  }

  const bestScore = Math.max(existing.best_score, score);
  getDb()
    .prepare(
      `UPDATE class_completions SET best_score = ?, total_questions = ?, attempts = attempts + 1
       WHERE member_id = ? AND class = ?`
    )
    .run(bestScore, totalQuestions, memberId, classKey);
}

export function getCompletedClasses(memberId) {
  const rows = getDb().prepare("SELECT class FROM class_completions WHERE member_id = ?").all(memberId);
  return rows.map((r) => r.class);
}

export function isClassCompleted(memberId, classKey) {
  const row = getDb()
    .prepare("SELECT 1 FROM class_completions WHERE member_id = ? AND class = ?")
    .get(memberId, classKey);
  return !!row;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
