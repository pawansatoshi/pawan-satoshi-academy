// bot/src/modules/progress/curriculum.js
//
// Pure logic for "is this class unlocked, given what's been
// completed" — zero dependencies, so it's testable the same way as
// recurrence.js and shuffle.js. Reads the mapping data (not code) from
// quizzes/schema/subject-class-mapping.json so the curriculum order
// lives in exactly one place.

import { readFileSync } from "node:fs";

let cachedMapping = null;

export function loadCurriculumMapping(mappingFilePath) {
  if (cachedMapping) return cachedMapping;
  const raw = JSON.parse(readFileSync(mappingFilePath, "utf-8"));
  cachedMapping = raw;
  return raw;
}

export function getCurriculumMapping() {
  if (!cachedMapping) {
    throw new Error("Curriculum mapping not loaded. Call loadCurriculumMapping() at startup first.");
  }
  return cachedMapping;
}

/**
 * Pure function: given the full curriculum order and a set of
 * completed class keys, determine whether `classKey` is unlocked.
 * Orientation (index 0) is always unlocked. Every other class
 * requires the immediately preceding class to be in `completedSet`.
 * Graduation requires class-12.
 */
export function isClassUnlocked(curriculumOrder, completedSet, classKey) {
  const index = curriculumOrder.indexOf(classKey);
  if (index === -1) {
    throw new Error(`Unknown class key: "${classKey}"`);
  }
  if (index === 0) return true;

  const previousClass = curriculumOrder[index - 1];
  return completedSet.has(previousClass);
}

/**
 * Pure function: returns the next locked class a member should work
 * toward, or null if everything (through Graduation) is complete.
 */
export function getNextIncompleteClass(curriculumOrder, completedSet) {
  for (const classKey of curriculumOrder) {
    if (!completedSet.has(classKey)) return classKey;
  }
  return null;
}
