import test from "node:test";
import assert from "node:assert/strict";
import { createGame, answerGame } from "../src/modules/games/index.js";
import { retrieve } from "../src/modules/ai-helper/index.js";

test("knowledge game creates a member-bound question and consumes it once", () => {
  const game = createGame("member-1");
  assert.ok(game.id);
  assert.equal(game.choices.length, 4);
  const result = answerGame(game.id, "member-1", game.answer);
  assert.equal(result.valid, true);
  assert.equal(result.correct, true);
  assert.equal(answerGame(game.id, "member-1", game.answer).valid, false);
});

test("retrieval helper finds lesson corpus content", () => {
  const results = retrieve("password seed phrase wallet security", 3);
  assert.ok(results.length > 0);
  assert.ok(results.some((item) => item.title.includes("security")));
});
