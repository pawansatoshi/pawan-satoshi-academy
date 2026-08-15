// bot/src/modules/quiz-engine/shuffle.js
//
// Pure array/option shuffling logic with zero dependencies —
// deliberately separated from randomizer.js (which needs the database
// for repeat-avoidance) so this math can be tested identically in any
// environment, same as recurrence.js.

export function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Shuffle a question's option order and remap correctAnswer to match,
 * so the same question doesn't always show the correct answer in the
 * same position.
 */
export function shuffleOptions(question) {
  const indices = shuffle([0, 1, 2, 3]);
  const options = indices.map((i) => question.options[i]);
  const correctAnswer = indices.indexOf(question.correctAnswer);
  return { ...question, options, correctAnswer };
}
