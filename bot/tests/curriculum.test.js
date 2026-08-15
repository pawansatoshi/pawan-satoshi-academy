// bot/tests/curriculum.test.js
//
// Tests the pure curriculum-sequencing logic in modules/progress/curriculum.js.
// Also validates the actual subject-class-mapping.json file's
// integrity against the actual Orientation question bank — checking
// that real content and real mapping data agree with each other.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { isClassUnlocked, getNextIncompleteClass } from "../src/modules/progress/curriculum.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mappingPath = join(__dirname, "../../quizzes/schema/subject-class-mapping.json");
const orientationBankPath = join(__dirname, "../../quizzes/question-banks/orientation/orientation.json");

const ORDER = [
  "orientation", "class-1", "class-2", "class-3", "class-4", "class-5",
  "class-6", "class-7", "class-8", "class-9", "class-10", "class-11",
  "class-12", "graduation"
];

test("isClassUnlocked: orientation is always unlocked, even with nothing completed", () => {
  assert.equal(isClassUnlocked(ORDER, new Set(), "orientation"), true);
});

test("isClassUnlocked: class-1 is locked until orientation is completed", () => {
  assert.equal(isClassUnlocked(ORDER, new Set(), "class-1"), false);
  assert.equal(isClassUnlocked(ORDER, new Set(["orientation"]), "class-1"), true);
});

test("isClassUnlocked: class-5 requires class-4, not just any earlier completion", () => {
  const partiallyCompleted = new Set(["orientation", "class-1", "class-2", "class-3"]);
  assert.equal(isClassUnlocked(ORDER, partiallyCompleted, "class-5"), false);

  const withClass4 = new Set([...partiallyCompleted, "class-4"]);
  assert.equal(isClassUnlocked(ORDER, withClass4, "class-5"), true);
});

test("isClassUnlocked: graduation requires class-12", () => {
  const almostDone = new Set(ORDER.slice(0, 13)); // orientation..class-12 minus graduation... actually includes class-12
  assert.equal(isClassUnlocked(ORDER, almostDone, "graduation"), true);

  const missingClass12 = new Set(ORDER.slice(0, 12)); // up through class-11 only
  assert.equal(isClassUnlocked(ORDER, missingClass12, "graduation"), false);
});

test("isClassUnlocked: throws on an unknown class key", () => {
  assert.throws(() => isClassUnlocked(ORDER, new Set(), "class-99"));
});

test("getNextIncompleteClass: returns orientation when nothing is completed", () => {
  assert.equal(getNextIncompleteClass(ORDER, new Set()), "orientation");
});

test("getNextIncompleteClass: returns the first gap, not just the last completed + 1", () => {
  // Completed orientation and class-2, but NOT class-1 (shouldn't happen in
  // practice since class-2 requires class-1, but the function should still
  // correctly report the first real gap if it somehow did).
  const completed = new Set(["orientation", "class-2"]);
  assert.equal(getNextIncompleteClass(ORDER, completed), "class-1");
});

test("getNextIncompleteClass: returns null when everything through graduation is done", () => {
  assert.equal(getNextIncompleteClass(ORDER, new Set(ORDER)), null);
});

test("subject-class-mapping.json is valid JSON with all 22 subjects mapped", () => {
  const mapping = JSON.parse(readFileSync(mappingPath, "utf-8"));
  const subjects = Object.keys(mapping.subjectToClass);
  assert.equal(subjects.length, 22, `Expected 22 subjects, found ${subjects.length}`);
});

test("subject-class-mapping.json: every mapped class exists in curriculumOrder", () => {
  const mapping = JSON.parse(readFileSync(mappingPath, "utf-8"));
  for (const [subject, classKey] of Object.entries(mapping.subjectToClass)) {
    assert.ok(
      mapping.curriculumOrder.includes(classKey),
      `Subject "${subject}" maps to class "${classKey}" which isn't in curriculumOrder`
    );
  }
});

test("the real Orientation question bank's class/subject fields match subject-class-mapping.json", () => {
  const mapping = JSON.parse(readFileSync(mappingPath, "utf-8"));
  const orientationQuestions = JSON.parse(readFileSync(orientationBankPath, "utf-8"));

  for (const q of orientationQuestions) {
    const expectedClass = mapping.subjectToClass[q.subject];
    assert.equal(
      q.class,
      expectedClass,
      `Question ${q.id} has class "${q.class}" but subject "${q.subject}" maps to "${expectedClass}"`
    );
  }
});
