// bot/src/modules/quiz-engine/randomizer.js
//
// Selects questions for each quiz mode from the loaded bank. This is
// what makes "randomization must work automatically" and "no manual
// question creation after deployment" true — every quiz, of every
// type, is assembled on demand from whatever the bank currently
// contains. Adding a new question file makes it immediately eligible
// for selection with zero code changes.

import { getQuestionBank } from "./loader.js";
import { getRecentQuestionIdsForMember } from "../../core/database.js";
import { shuffle, shuffleOptions } from "./shuffle.js";

export { shuffleOptions };

function filterBank({ subject = null, classKey = null, difficulty = null }) {
  const { questions } = getQuestionBank();
  return questions.filter(
    (q) =>
      (!subject || q.subject === subject) &&
      (!classKey || q.class === classKey) &&
      (!difficulty || q.difficulty === difficulty)
  );
}

/**
 * Core selection: pick `count` questions from a filtered pool,
 * preferring ones the member hasn't seen recently. Falls back to
 * allowing repeats if the bank for that filter is smaller than the
 * requested count — a small mastery-sized bank should never make a
 * quiz mode simply fail.
 */
function selectQuestions(pool, count, excludeIds = new Set()) {
  const fresh = pool.filter((q) => !excludeIds.has(q.id));
  const source = fresh.length >= count ? fresh : pool; // fall back to full pool if not enough fresh ones
  const chosen = shuffle(source).slice(0, Math.min(count, source.length));
  return chosen.map(shuffleOptions);
}

export function selectPracticeQuestions({ subject, difficulty = null, count = 5 }) {
  const pool = filterBank({ subject, difficulty });
  return selectQuestions(pool, count);
}

export function selectDailyQuizQuestions({ memberId, count = 5 }) {
  const pool = filterBank({});
  const recentIds = new Set(getRecentQuestionIdsForMember(memberId, 7));
  return selectQuestions(pool, count, recentIds);
}

export function selectWeeklyQuizQuestions({ subject = null, classKey = null, count = 10 }) {
  const pool = filterBank({ subject, classKey });
  return selectQuestions(pool, count);
}

export function selectMonthlyExamQuestions({ classKey = null, count = 25 }) {
  // Monthly exams weight toward intermediate/advanced where available,
  // but never fail if a mastery-sized beginner bank doesn't have any.
  const pool = filterBank({ classKey });
  const advancedPool = pool.filter((q) => q.difficulty !== "beginner");
  const usablePool = advancedPool.length >= count ? advancedPool : pool;
  return selectQuestions(usablePool, count);
}

/**
 * Chapter Assessment: comprehensive over EVERY subject tagged with
 * this class (a class can span multiple subjects, e.g. class-1 =
 * internet-basics + digital-literacy). Required to unlock the next
 * class — see modules/progress. No repeat-avoidance: an assessment
 * should test the same material consistently across retries, not
 * dodge questions the member got wrong before.
 */
export function selectChapterAssessmentQuestions({ classKey, count = 15 }) {
  const pool = filterBank({ classKey });
  return selectQuestions(pool, count);
}

/**
 * Final Examination: comprehensive across the full technical/practical
 * curriculum (Class 1 through Class 12). Orientation is excluded —
 * it's onboarding material, not exam-worthy graduation content.
 */
export function selectFinalExamQuestions({ count = 40 }) {
  const { questions } = getQuestionBank();
  const pool = questions.filter((q) => q.class !== "orientation" && q.class !== "graduation");
  return selectQuestions(pool, count);
}

export function getAvailableSubjects() {
  const { questions } = getQuestionBank();
  return [...new Set(questions.map((q) => q.subject))].sort();
}
