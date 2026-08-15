// bot/src/modules/quiz-engine/validator.js
//
// Pure validation logic, zero external dependencies (no discord.js,
// no database) so it can run and be unit-tested identically in any
// environment. This is what enforces "no placeholder questions" and
// "no manual work after deployment" at load time — a malformed or
// low-effort question fails loudly instead of silently reaching
// production.

const VALID_CLASSES = [
  "orientation", "class-1", "class-2", "class-3", "class-4",
  "class-5", "class-6", "class-7", "class-8", "class-9",
  "class-10", "class-11", "class-12", "graduation"
];

const VALID_DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const ID_PATTERN = /^[a-z0-9-]+$/;

/**
 * Validate a single question object. Returns an array of error
 * strings — empty array means valid.
 */
export function validateQuestion(q) {
  const errors = [];

  if (!q || typeof q !== "object") {
    return ["Question is not an object"];
  }

  if (typeof q.id !== "string" || !ID_PATTERN.test(q.id)) {
    errors.push(`Invalid id: "${q.id}" (must be lowercase letters/numbers/hyphens)`);
  }

  if (!VALID_CLASSES.includes(q.class)) {
    errors.push(`Invalid class: "${q.class}"`);
  }

  if (typeof q.subject !== "string" || q.subject.trim().length === 0) {
    errors.push("Missing or empty subject");
  }

  if (typeof q.topic !== "string" || q.topic.trim().length === 0) {
    errors.push("Missing or empty topic");
  }

  if (!VALID_DIFFICULTIES.includes(q.difficulty)) {
    errors.push(`Invalid difficulty: "${q.difficulty}"`);
  }

  if (typeof q.question !== "string" || q.question.trim().length < 10) {
    errors.push("Question text missing or too short (< 10 chars)");
  }

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push(`Must have exactly 4 options (found ${Array.isArray(q.options) ? q.options.length : "non-array"})`);
  } else {
    const nonEmpty = q.options.every((o) => typeof o === "string" && o.trim().length > 0);
    if (!nonEmpty) errors.push("All 4 options must be non-empty strings");

    const unique = new Set(q.options.map((o) => (typeof o === "string" ? o.trim().toLowerCase() : o)));
    if (unique.size !== q.options.length) errors.push("Options must not contain duplicates");
  }

  if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) {
    errors.push(`correctAnswer must be an integer 0-3, got: ${q.correctAnswer}`);
  }

  if (typeof q.explanation !== "string" || q.explanation.trim().length < 10) {
    errors.push("Explanation missing or too short (< 10 chars)");
  }

  if (!Array.isArray(q.tags) || q.tags.length === 0) {
    errors.push("Must have at least 1 tag");
  }

  if (q.reference !== undefined && q.reference !== null && typeof q.reference !== "string") {
    errors.push("reference must be a string or null");
  }

  // Guard against the most common "placeholder" tells.
  const lowerQuestion = (q.question || "").toLowerCase();
  const placeholderMarkers = ["todo", "placeholder", "lorem ipsum", "fixme", "xxx", "sample question"];
  if (placeholderMarkers.some((marker) => lowerQuestion.includes(marker))) {
    errors.push("Question text contains a placeholder marker — real content required");
  }

  return errors;
}

/**
 * Validate an array of questions, checking both individual validity
 * and set-level rules (unique IDs across the whole set).
 */
export function validateQuestionSet(questions) {
  const results = { valid: [], invalid: [] };
  const seenIds = new Set();

  for (const q of questions) {
    const errors = validateQuestion(q);

    if (q && typeof q.id === "string") {
      if (seenIds.has(q.id)) {
        errors.push(`Duplicate id "${q.id}" within this set`);
      }
      seenIds.add(q.id);
    }

    if (errors.length === 0) {
      results.valid.push(q);
    } else {
      results.invalid.push({ question: q, errors });
    }
  }

  return results;
}
