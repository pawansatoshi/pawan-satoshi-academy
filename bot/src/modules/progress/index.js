// bot/src/modules/progress/index.js
//
// Connects the pure curriculum logic in curriculum.js to real member
// data. This is what /assessment and the quiz engine call to check
// "is this member allowed to attempt this chapter" and to record a
// pass.

import { getCompletedClasses, recordClassCompletion } from "../../core/database.js";
import { getCurriculumMapping, isClassUnlocked as pureIsUnlocked, getNextIncompleteClass } from "./curriculum.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("progress");

export function isClassUnlockedForMember(memberId, classKey) {
  const { curriculumOrder } = getCurriculumMapping();
  const completedSet = new Set(getCompletedClasses(memberId));
  return pureIsUnlocked(curriculumOrder, completedSet, classKey);
}

export function recordChapterPass({ memberId, classKey, score, totalQuestions }) {
  recordClassCompletion({ memberId, classKey, score, totalQuestions });
  logger.info({ memberId, classKey, score, totalQuestions }, "Chapter assessment passed");
}

export function getMemberNextClass(memberId) {
  const { curriculumOrder } = getCurriculumMapping();
  const completedSet = new Set(getCompletedClasses(memberId));
  return getNextIncompleteClass(curriculumOrder, completedSet);
}

export function getMemberProgressSummary(memberId) {
  const { curriculumOrder, classToTitle } = getCurriculumMapping();
  const completedSet = new Set(getCompletedClasses(memberId));

  return curriculumOrder.map((classKey) => ({
    classKey,
    title: classToTitle[classKey] || classKey,
    completed: completedSet.has(classKey),
    unlocked: pureIsUnlocked(curriculumOrder, completedSet, classKey)
  }));
}
