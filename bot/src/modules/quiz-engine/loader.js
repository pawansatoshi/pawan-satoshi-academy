// bot/src/modules/quiz-engine/loader.js
//
// Discovers every JSON file under quizzes/question-banks/ (recursively
// — subjects are organized into subfolders), validates every question,
// and builds an in-memory index. Invalid questions are logged loudly
// and EXCLUDED from the live bank rather than crashing the whole bot —
// one bad file should never take down quiz functionality entirely.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { validateQuestionSet } from "./validator.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("quiz-loader");

let cachedBank = null;

function findJsonFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...findJsonFiles(fullPath));
    } else if (entry.endsWith(".json") && entry !== "question-schema.json") {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Load and validate the entire question bank from disk. Returns
 * { questions, stats } where questions is a flat array of every valid
 * question, and stats reports counts and any rejected questions for
 * visibility (never silently dropped without a log trail).
 */
export function loadQuestionBank(questionBanksDir) {
  const files = findJsonFiles(questionBanksDir);
  const allQuestions = [];
  const rejectedByFile = {};

  for (const file of files) {
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(file, "utf-8"));
    } catch (err) {
      logger.error({ file, err: err.message }, "Failed to parse question bank file — skipping entire file");
      continue;
    }

    const questionsInFile = Array.isArray(parsed) ? parsed : parsed.questions;
    if (!Array.isArray(questionsInFile)) {
      logger.error({ file }, "File does not contain a questions array — skipping");
      continue;
    }

    const { valid, invalid } = validateQuestionSet(questionsInFile);

    if (invalid.length > 0) {
      rejectedByFile[file] = invalid;
      logger.warn(
        { file, rejectedCount: invalid.length },
        "Some questions in this file failed validation and were excluded"
      );
      for (const { question, errors } of invalid) {
        logger.warn({ id: question?.id, errors }, "Rejected question");
      }
    }

    allQuestions.push(...valid);
  }

  const stats = {
    totalFiles: files.length,
    totalValidQuestions: allQuestions.length,
    totalRejected: Object.values(rejectedByFile).reduce((sum, arr) => sum + arr.length, 0),
    bySubject: countBy(allQuestions, "subject"),
    byClass: countBy(allQuestions, "class"),
    byDifficulty: countBy(allQuestions, "difficulty")
  };

  logger.info(stats, "Question bank loaded");

  cachedBank = { questions: allQuestions, stats, rejectedByFile };
  return cachedBank;
}

function countBy(questions, field) {
  const counts = {};
  for (const q of questions) {
    counts[q[field]] = (counts[q[field]] || 0) + 1;
  }
  return counts;
}

export function getQuestionBank() {
  if (!cachedBank) {
    throw new Error("Question bank not loaded yet. Call loadQuestionBank() at startup first.");
  }
  return cachedBank;
}
