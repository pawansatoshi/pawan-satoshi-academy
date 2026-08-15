// bot/src/modules/xp/index.js
// XP is derived from real quiz activity already persisted in quiz_attempts.
// No XP is granted for commands alone; answering questions is the source of truth.

import { getMember, upsertMember } from "../../core/database.js";

const XP_CORRECT = 10;
const XP_INCORRECT = 2;
const XP_LEVEL_SIZE = 100;

function levelForXp(xp) {
  return Math.floor(Math.max(0, xp) / XP_LEVEL_SIZE);
}

export function awardQuizXp(memberId, wasCorrect) {
  const current = getMember(memberId) || { xp: 0, level: 0, streak_days: 0, last_active_at: null };
  const now = new Date();
  const previous = current.last_active_at ? new Date(current.last_active_at) : null;

  let streakDays = current.streak_days || 0;
  if (!previous || Number.isNaN(previous.getTime())) {
    streakDays = 1;
  } else {
    const previousDay = previous.toISOString().slice(0, 10);
    const today = now.toISOString().slice(0, 10);
    const previousDate = new Date(`${previousDay}T00:00:00.000Z`);
    const todayDate = new Date(`${today}T00:00:00.000Z`);
    const diffDays = Math.round((todayDate - previousDate) / 86400000);
    if (diffDays === 1) streakDays += 1;
    else if (diffDays > 1) streakDays = 1;
  }

  const xp = (current.xp || 0) + (wasCorrect ? XP_CORRECT : XP_INCORRECT);
  const level = levelForXp(xp);
  upsertMember(memberId, {
    xp,
    level,
    streak_days: streakDays,
    last_active_at: now.toISOString()
  });

  return { xp, level, streakDays, gained: wasCorrect ? XP_CORRECT : XP_INCORRECT };
}

export function getLevelProgress(xp = 0) {
  const safeXp = Math.max(0, xp);
  const level = levelForXp(safeXp);
  const intoLevel = safeXp % XP_LEVEL_SIZE;
  return {
    level,
    xp: safeXp,
    current: intoLevel,
    required: XP_LEVEL_SIZE,
    remaining: XP_LEVEL_SIZE - intoLevel
  };
}

export { XP_CORRECT, XP_INCORRECT, XP_LEVEL_SIZE };
