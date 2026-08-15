// bot/tests/quizEngine.test.js
//
// Tests the dependency-free parts of the quiz engine: validation
// logic and option-shuffling math. randomizer.js's selection
// functions depend on core/database.js (better-sqlite3), so those are
// syntax-checked only here and exercised for real in CI — same
// disclosed limitation as the other DB-backed modules.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { validateQuestion, validateQuestionSet } from "../src/modules/quiz-engine/validator.js";
import { shuffleOptions } from "../src/modules/quiz-engine/shuffle.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const orientationBankPath = join(__dirname, "../../quizzes/question-banks/orientation/orientation.json");
const internetBasicsBankPath = join(__dirname, "../../quizzes/question-banks/internet-basics/internet-basics.json");
const digitalLiteracyBankPath = join(__dirname, "../../quizzes/question-banks/digital-literacy/digital-literacy.json");
const cyberSecurityBankPath = join(__dirname, "../../quizzes/question-banks/cyber-security/cyber-security.json");
const passwordSafetyBankPath = join(__dirname, "../../quizzes/question-banks/password-safety/password-safety.json");
const digitalPaymentsBankPath = join(__dirname, "../../quizzes/question-banks/digital-payments/digital-payments.json");
const aiBankPath = join(__dirname, "../../quizzes/question-banks/ai/ai.json");
const promptEngineeringBankPath = join(__dirname, "../../quizzes/question-banks/prompt-engineering/prompt-engineering.json");
const gitGithubBankPath = join(__dirname, "../../quizzes/question-banks/git-github/git-github.json");
const linuxBankPath = join(__dirname, "../../quizzes/question-banks/linux/linux.json");
const programmingBankPath = join(__dirname, "../../quizzes/question-banks/programming/programming.json");
const bitcoinBankPath = join(__dirname, "../../quizzes/question-banks/bitcoin/bitcoin.json");
const blockchainBankPath = join(__dirname, "../../quizzes/question-banks/blockchain/blockchain.json");
const ethereumBankPath = join(__dirname, "../../quizzes/question-banks/ethereum/ethereum.json");
const baseBankPath = join(__dirname, "../../quizzes/question-banks/base/base.json");
const stablecoinsBankPath = join(__dirname, "../../quizzes/question-banks/stablecoins/stablecoins.json");
const defiBankPath = join(__dirname, "../../quizzes/question-banks/defi/defi.json");

const ALL_COMPLETED_BANK_PATHS = [
  orientationBankPath, internetBasicsBankPath, digitalLiteracyBankPath,
  cyberSecurityBankPath, passwordSafetyBankPath, digitalPaymentsBankPath,
  aiBankPath, promptEngineeringBankPath, gitGithubBankPath, linuxBankPath,
  programmingBankPath, bitcoinBankPath, blockchainBankPath, ethereumBankPath,
  baseBankPath, stablecoinsBankPath, defiBankPath
];

test("validateQuestion accepts a well-formed question", () => {
  const q = {
    id: "sample-001", class: "orientation", subject: "orientation", topic: "test",
    difficulty: "beginner", question: "What is a real test question about?",
    options: ["A", "B", "C", "D"], correctAnswer: 0,
    explanation: "This is a real explanation of the answer.", tags: ["test"], reference: null
  };
  assert.deepEqual(validateQuestion(q), []);
});

test("validateQuestion rejects placeholder text", () => {
  const q = {
    id: "sample-002", class: "orientation", subject: "orientation", topic: "test",
    difficulty: "beginner", question: "TODO: write a real question here",
    options: ["A", "B", "C", "D"], correctAnswer: 0,
    explanation: "Explanation goes here eventually.", tags: ["test"], reference: null
  };
  const errors = validateQuestion(q);
  assert.ok(errors.some((e) => e.includes("placeholder")));
});

test("validateQuestion rejects duplicate options", () => {
  const q = {
    id: "sample-003", class: "orientation", subject: "orientation", topic: "test",
    difficulty: "beginner", question: "Which of these is correct, really truly?",
    options: ["Same", "Same", "Different", "Other"], correctAnswer: 0,
    explanation: "This explanation is long enough to pass.", tags: ["test"], reference: null
  };
  const errors = validateQuestion(q);
  assert.ok(errors.some((e) => e.includes("duplicates")));
});

test("validateQuestion rejects an out-of-range correctAnswer", () => {
  const q = {
    id: "sample-004", class: "orientation", subject: "orientation", topic: "test",
    difficulty: "beginner", question: "Which of these is correct, really truly?",
    options: ["A", "B", "C", "D"], correctAnswer: 5,
    explanation: "This explanation is long enough to pass.", tags: ["test"], reference: null
  };
  const errors = validateQuestion(q);
  assert.ok(errors.some((e) => e.includes("correctAnswer")));
});

test("validateQuestionSet catches duplicate IDs within a set", () => {
  const base = {
    class: "orientation", subject: "orientation", topic: "test", difficulty: "beginner",
    question: "Which of these is correct, really truly?",
    options: ["A", "B", "C", "D"], correctAnswer: 0,
    explanation: "This explanation is long enough to pass.", tags: ["test"], reference: null
  };
  const { invalid } = validateQuestionSet([
    { ...base, id: "dup-001" },
    { ...base, id: "dup-001" }
  ]);
  assert.equal(invalid.length, 1); // the second one is flagged as a duplicate
});

test("shuffleOptions preserves the correct answer's text after reshuffling", () => {
  const q = {
    id: "shuffle-test", options: ["Right", "Wrong1", "Wrong2", "Wrong3"], correctAnswer: 0
  };
  for (let i = 0; i < 20; i++) {
    const shuffled = shuffleOptions(q);
    assert.equal(shuffled.options[shuffled.correctAnswer], "Right");
    assert.equal(shuffled.options.length, 4);
    assert.deepEqual([...shuffled.options].sort(), ["Right", "Wrong1", "Wrong2", "Wrong3"]);
  }
});

test("the real Orientation question bank file is 100% valid, zero rejects", () => {
  const data = JSON.parse(readFileSync(orientationBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions found: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  assert.ok(valid.length >= 25, "Orientation bank should have a substantial, non-trivial question count");
});

test("the real Orientation question bank has no duplicate question text", () => {
  const data = JSON.parse(readFileSync(orientationBankPath, "utf-8"));
  const questionTexts = data.map((q) => q.question.trim().toLowerCase());
  assert.equal(new Set(questionTexts).size, questionTexts.length, "Duplicate question text found — violates 'never pad with repetitive questions'");
});

test("the real Orientation question bank covers a healthy spread of distinct topics (not repetitive)", () => {
  const data = JSON.parse(readFileSync(orientationBankPath, "utf-8"));
  const topics = new Set(data.map((q) => q.topic));
  assert.ok(topics.size >= 15, `Expected a wide topic spread for a mastery-based bank, got ${topics.size} distinct topics`);
});

test("the real Internet Basics question bank file is 100% valid, zero rejects", () => {
  const data = JSON.parse(readFileSync(internetBasicsBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions found: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  assert.ok(valid.length >= 30, "Internet Basics is a medium-sized subject and should have a substantial question count");
});

test("the real Internet Basics question bank has no duplicate question text", () => {
  const data = JSON.parse(readFileSync(internetBasicsBankPath, "utf-8"));
  const questionTexts = data.map((q) => q.question.trim().toLowerCase());
  assert.equal(new Set(questionTexts).size, questionTexts.length, "Duplicate question text found");
});

test("the real Internet Basics question bank is entirely tagged class-1 / internet-basics", () => {
  const data = JSON.parse(readFileSync(internetBasicsBankPath, "utf-8"));
  for (const q of data) {
    assert.equal(q.class, "class-1", `Question ${q.id} has wrong class: ${q.class}`);
    assert.equal(q.subject, "internet-basics", `Question ${q.id} has wrong subject: ${q.subject}`);
  }
});

test("the real Digital Literacy question bank file is 100% valid, zero rejects", () => {
  const data = JSON.parse(readFileSync(digitalLiteracyBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions found: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  assert.ok(valid.length >= 25, "Digital Literacy should have a substantial, non-trivial question count");
});

test("the real Digital Literacy question bank has no duplicate question text", () => {
  const data = JSON.parse(readFileSync(digitalLiteracyBankPath, "utf-8"));
  const questionTexts = data.map((q) => q.question.trim().toLowerCase());
  assert.equal(new Set(questionTexts).size, questionTexts.length, "Duplicate question text found");
});

test("the real Digital Literacy question bank is entirely tagged class-1 / digital-literacy", () => {
  const data = JSON.parse(readFileSync(digitalLiteracyBankPath, "utf-8"));
  for (const q of data) {
    assert.equal(q.class, "class-1", `Question ${q.id} has wrong class: ${q.class}`);
    assert.equal(q.subject, "digital-literacy", `Question ${q.id} has wrong subject: ${q.subject}`);
  }
});

test("Internet Basics and Digital Literacy do not share any topic or duplicate question text (clean subject separation)", () => {
  const ib = JSON.parse(readFileSync(internetBasicsBankPath, "utf-8"));
  const dl = JSON.parse(readFileSync(digitalLiteracyBankPath, "utf-8"));
  const ibTopics = new Set(ib.map((q) => q.topic));
  const dlTopics = new Set(dl.map((q) => q.topic));
  const overlap = [...ibTopics].filter((t) => dlTopics.has(t));
  assert.equal(overlap.length, 0, `Unexpected topic overlap between subjects: ${overlap.join(", ")}`);
});

test("the real Cyber Security question bank file is 100% valid, zero rejects", () => {
  const data = JSON.parse(readFileSync(cyberSecurityBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions found: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  assert.ok(valid.length >= 30, "Cyber Security should have a substantial question count");
  for (const q of data) {
    assert.equal(q.class, "class-2");
    assert.equal(q.subject, "cyber-security");
  }
});

test("the real Password Safety question bank file is 100% valid, zero rejects", () => {
  const data = JSON.parse(readFileSync(passwordSafetyBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions found: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  for (const q of data) {
    assert.equal(q.class, "class-2");
    assert.equal(q.subject, "password-safety");
  }
});

test("Cyber Security and Password Safety (both class-2) do not overlap in topic", () => {
  const cs = JSON.parse(readFileSync(cyberSecurityBankPath, "utf-8"));
  const ps = JSON.parse(readFileSync(passwordSafetyBankPath, "utf-8"));
  const csTopics = new Set(cs.map((q) => q.topic));
  const psTopics = new Set(ps.map((q) => q.topic));
  const overlap = [...csTopics].filter((t) => psTopics.has(t));
  assert.equal(overlap.length, 0, `Unexpected topic overlap: ${overlap.join(", ")}`);
});

test("the real Digital Payments question bank file is 100% valid, zero rejects", () => {
  const data = JSON.parse(readFileSync(digitalPaymentsBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions found: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  for (const q of data) {
    assert.equal(q.class, "class-3");
    assert.equal(q.subject, "digital-payments");
  }
});

test("global check: every question ID across every completed question bank file is unique", () => {
  const allIds = [];
  for (const f of ALL_COMPLETED_BANK_PATHS) {
    const data = JSON.parse(readFileSync(f, "utf-8"));
    allIds.push(...data.map((q) => q.id));
  }
  assert.equal(new Set(allIds).size, allIds.length, "Duplicate question ID found across separate subject files");
});

test("global check: no question text is duplicated across any completed question bank file", () => {
  const allTexts = [];
  for (const f of ALL_COMPLETED_BANK_PATHS) {
    const data = JSON.parse(readFileSync(f, "utf-8"));
    allTexts.push(...data.map((q) => q.question.trim().toLowerCase()));
  }
  assert.equal(new Set(allTexts).size, allTexts.length, "Duplicate question text found across separate subject files");
});

test("global check: no topic is shared between any two completed subject files", () => {
  const topicsByFile = ALL_COMPLETED_BANK_PATHS.map((f) => {
    const data = JSON.parse(readFileSync(f, "utf-8"));
    return { file: f, topics: new Set(data.map((q) => q.topic)) };
  });
  for (let i = 0; i < topicsByFile.length; i++) {
    for (let j = i + 1; j < topicsByFile.length; j++) {
      const overlap = [...topicsByFile[i].topics].filter((t) => topicsByFile[j].topics.has(t));
      assert.equal(
        overlap.length, 0,
        `Topic overlap between ${topicsByFile[i].file} and ${topicsByFile[j].file}: ${overlap.join(", ")}`
      );
    }
  }
});

test("the real AI question bank file is 100% valid, zero rejects, correctly tagged", () => {
  const data = JSON.parse(readFileSync(aiBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  for (const q of data) {
    assert.equal(q.class, "class-7");
    assert.equal(q.subject, "ai");
  }
});

test("the real Prompt Engineering question bank file is 100% valid, zero rejects, correctly tagged", () => {
  const data = JSON.parse(readFileSync(promptEngineeringBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  for (const q of data) {
    assert.equal(q.class, "class-7");
    assert.equal(q.subject, "prompt-engineering");
  }
});

test("the real Git & GitHub question bank file is 100% valid, zero rejects, correctly tagged", () => {
  const data = JSON.parse(readFileSync(gitGithubBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  for (const q of data) {
    assert.equal(q.class, "class-4");
    assert.equal(q.subject, "git-github");
  }
});

test("the real Linux question bank file is 100% valid, zero rejects, correctly tagged", () => {
  const data = JSON.parse(readFileSync(linuxBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  for (const q of data) {
    assert.equal(q.class, "class-5");
    assert.equal(q.subject, "linux");
  }
});

test("the real Programming question bank file is 100% valid, zero rejects, correctly tagged", () => {
  const data = JSON.parse(readFileSync(programmingBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  for (const q of data) {
    assert.equal(q.class, "class-6");
    assert.equal(q.subject, "programming");
  }
});

test("the real Bitcoin question bank file is 100% valid, zero rejects, correctly tagged", () => {
  const data = JSON.parse(readFileSync(bitcoinBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  for (const q of data) {
    assert.equal(q.class, "class-8");
    assert.equal(q.subject, "bitcoin");
  }
});

test("the real Blockchain question bank file is 100% valid, zero rejects, correctly tagged", () => {
  const data = JSON.parse(readFileSync(blockchainBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  for (const q of data) {
    assert.equal(q.class, "class-8");
    assert.equal(q.subject, "blockchain");
  }
});

test("Bitcoin and Blockchain (both class-8) share zero topics despite being closely related subjects", () => {
  const btc = JSON.parse(readFileSync(bitcoinBankPath, "utf-8"));
  const bc = JSON.parse(readFileSync(blockchainBankPath, "utf-8"));
  const btcTopics = new Set(btc.map((q) => q.topic));
  const bcTopics = new Set(bc.map((q) => q.topic));
  const overlap = [...btcTopics].filter((t) => bcTopics.has(t));
  assert.equal(overlap.length, 0, `Unexpected topic overlap between Bitcoin and Blockchain: ${overlap.join(", ")}`);
});

test("the real Ethereum question bank file is 100% valid, zero rejects, correctly tagged", () => {
  const data = JSON.parse(readFileSync(ethereumBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  for (const q of data) {
    assert.equal(q.class, "class-9");
    assert.equal(q.subject, "ethereum");
  }
});

test("the real Base question bank file is 100% valid, zero rejects, correctly tagged", () => {
  const data = JSON.parse(readFileSync(baseBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  for (const q of data) {
    assert.equal(q.class, "class-10");
    assert.equal(q.subject, "base");
  }
});

test("the real Stablecoins question bank file is 100% valid, zero rejects, correctly tagged", () => {
  const data = JSON.parse(readFileSync(stablecoinsBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  for (const q of data) {
    assert.equal(q.class, "class-10");
    assert.equal(q.subject, "stablecoins");
  }
});

test("Base and Stablecoins (both class-10) share zero topics", () => {
  const base = JSON.parse(readFileSync(baseBankPath, "utf-8"));
  const stable = JSON.parse(readFileSync(stablecoinsBankPath, "utf-8"));
  const baseTopics = new Set(base.map((q) => q.topic));
  const stableTopics = new Set(stable.map((q) => q.topic));
  const overlap = [...baseTopics].filter((t) => stableTopics.has(t));
  assert.equal(overlap.length, 0, `Unexpected topic overlap between Base and Stablecoins: ${overlap.join(", ")}`);
});

test("Ethereum shares zero topics with Blockchain (general concepts) or Bitcoin (different protocol)", () => {
  const eth = JSON.parse(readFileSync(ethereumBankPath, "utf-8"));
  const bc = JSON.parse(readFileSync(blockchainBankPath, "utf-8"));
  const btc = JSON.parse(readFileSync(bitcoinBankPath, "utf-8"));
  const ethTopics = new Set(eth.map((q) => q.topic));
  const bcOverlap = [...ethTopics].filter((t) => new Set(bc.map((q) => q.topic)).has(t));
  const btcOverlap = [...ethTopics].filter((t) => new Set(btc.map((q) => q.topic)).has(t));
  assert.equal(bcOverlap.length, 0, `Ethereum/Blockchain overlap: ${bcOverlap.join(", ")}`);
  assert.equal(btcOverlap.length, 0, `Ethereum/Bitcoin overlap: ${btcOverlap.join(", ")}`);
});

test("Base shares zero topics with Ethereum (Layer 1 focus reserved separately)", () => {
  const base = JSON.parse(readFileSync(baseBankPath, "utf-8"));
  const eth = JSON.parse(readFileSync(ethereumBankPath, "utf-8"));
  const baseTopics = new Set(base.map((q) => q.topic));
  const ethTopics = new Set(eth.map((q) => q.topic));
  const overlap = [...baseTopics].filter((t) => ethTopics.has(t));
  assert.equal(overlap.length, 0, `Unexpected topic overlap between Base and Ethereum: ${overlap.join(", ")}`);
});

test("the real DeFi question bank file is 100% valid, zero rejects, correctly tagged", () => {
  const data = JSON.parse(readFileSync(defiBankPath, "utf-8"));
  const { valid, invalid } = validateQuestionSet(data);
  assert.equal(invalid.length, 0, `Invalid questions: ${JSON.stringify(invalid.map((i) => i.question?.id))}`);
  for (const q of data) {
    assert.equal(q.class, "class-11");
    assert.equal(q.subject, "defi");
  }
});

test("DeFi shares zero topics with Stablecoins, despite DeFi mentioning stablecoins as a building block", () => {
  const defi = JSON.parse(readFileSync(defiBankPath, "utf-8"));
  const stable = JSON.parse(readFileSync(stablecoinsBankPath, "utf-8"));
  const defiTopics = new Set(defi.map((q) => q.topic));
  const stableTopics = new Set(stable.map((q) => q.topic));
  const overlap = [...defiTopics].filter((t) => stableTopics.has(t));
  assert.equal(overlap.length, 0, `Unexpected topic overlap between DeFi and Stablecoins: ${overlap.join(", ")}`);
});

test("DeFi question bank contains no investment-advice or price-speculation language patterns", () => {
  const data = JSON.parse(readFileSync(defiBankPath, "utf-8"));
  const forbiddenPatterns = [
    /\bguaranteed profit/i, /\byou should invest/i, /\bwill (definitely|certainly) (increase|rise|moon)/i,
    /\bbest investment/i, /\bsafe investment\b/i
  ];
  for (const q of data) {
    const fullText = `${q.question} ${q.explanation} ${q.options.join(" ")}`;
    for (const pattern of forbiddenPatterns) {
      assert.doesNotMatch(fullText, pattern, `Question ${q.id} may contain investment-advice language matching ${pattern}`);
    }
  }
});

test("every completed subject file has a healthy topic-to-question ratio (mastery-based, not repetitive filler)", () => {
  for (const f of ALL_COMPLETED_BANK_PATHS) {
    const data = JSON.parse(readFileSync(f, "utf-8"));
    const topics = new Set(data.map((q) => q.topic));
    const ratio = topics.size / data.length;
    assert.ok(ratio >= 0.5, `${f}: topic diversity ratio ${ratio.toFixed(2)} is low — check for repetitive filler`);
  }
});
