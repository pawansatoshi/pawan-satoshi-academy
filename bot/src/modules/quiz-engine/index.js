// bot/src/modules/quiz-engine/index.js
//
// Orchestrates quiz delivery across every mode:
//  - Practice / Daily / Weekly / Monthly Challenge — OPTIONAL, no
//    effect on curriculum progression.
//  - Chapter Assessment / Final Examination — REQUIRED. Passing a
//    Chapter Assessment unlocks the next class; passing the Final
//    Examination is required for the Graduation Certificate.
//    Unlimited retries are always allowed.
//
// Every wrong answer, in every mode, immediately shows: the correct
// answer, the explanation, the reference (if any), and a suggested
// topic to review — the goal is learning, not punishment.

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import {
  selectPracticeQuestions,
  selectDailyQuizQuestions,
  selectWeeklyQuizQuestions,
  selectMonthlyExamQuestions,
  selectChapterAssessmentQuestions,
  selectFinalExamQuestions
} from "./randomizer.js";
import { recordQuizAttempt, recordCommunityQuizAnswer, getMemberQuizStats } from "../../core/database.js";
import { isClassUnlockedForMember, recordChapterPass, getMemberProgressSummary, getMemberNextClass } from "../progress/index.js";
import { getCurriculumMapping } from "../progress/curriculum.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("quiz-engine");

const OPTION_LETTERS = ["A", "B", "C", "D"];
const SESSION_BUTTON_PREFIX = "quiz_session";
const COMMUNITY_BUTTON_PREFIX = "quiz_community";

// Required-mode pass thresholds. Unlimited retries — failing never
// locks a member out, it just means "not yet."
const CHAPTER_PASS_THRESHOLD = 0.7;
const FINAL_EXAM_PASS_THRESHOLD = 0.75;

// In-memory session store: sessionId -> { questions, index, memberId, correctCount, mode, subject, classKey }
const sessions = new Map();

function makeSessionId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function buildQuestionEmbed(question, { questionNumber = null, total = null, footer = null } = {}) {
  const embed = new EmbedBuilder()
    .setColor("#9B59B6")
    .setTitle(questionNumber ? `Question ${questionNumber}${total ? ` / ${total}` : ""}` : "Quiz")
    .setDescription(question.question)
    .addFields(
      question.options.map((opt, i) => ({ name: OPTION_LETTERS[i], value: opt, inline: false }))
    );
  if (footer) embed.setFooter({ text: footer });
  return embed;
}

function buildAnswerButtons(customIdPrefix, question) {
  const row = new ActionRowBuilder();
  question.options.forEach((_, i) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`${customIdPrefix}:${question.id}:${i}`)
        .setLabel(OPTION_LETTERS[i])
        .setStyle(ButtonStyle.Primary)
    );
  });
  return row;
}

function buildFeedbackEmbed(question, wasCorrect) {
  const suggestedReview = `Review in Academy Hub → **${question.subject}** → *${question.topic}*`;
  const referenceLine = question.reference ? `\n📎 Reference: ${question.reference}` : "";

  return new EmbedBuilder()
    .setColor(wasCorrect ? "#2ECC71" : "#E74C3C")
    .setTitle(wasCorrect ? "✅ Correct!" : `❌ Not quite — correct answer: ${OPTION_LETTERS[question.correctAnswer]}`)
    .setDescription(`${question.explanation}${referenceLine}`)
    .setFooter({ text: suggestedReview });
}

function modeLabel(mode) {
  return {
    practice: "Practice Mode",
    daily: "Daily Quiz",
    weekly: "Weekly Quiz",
    challenge: "Challenge Quiz",
    chapter: "Chapter Assessment (required)",
    final: "Final Examination (required for Graduation)"
  }[mode] || "Quiz";
}

// ── Generic session engine (backs every step-through mode) ─────────

async function startSession(interaction, { mode, questions, subject = null, classKey = null }) {
  if (questions.length === 0) {
    await interaction.reply({
      content: `No questions are available yet for this ${subject ? `subject (**${subject}**)` : `class (**${classKey}**)`}. Check back once that content has been added.`,
      ephemeral: true
    });
    return;
  }

  const sessionId = makeSessionId();
  sessions.set(sessionId, {
    questions,
    index: 0,
    memberId: interaction.user.id,
    correctCount: 0,
    mode,
    subject,
    classKey
  });

  const first = questions[0];
  const embed = buildQuestionEmbed(first, { questionNumber: 1, total: questions.length, footer: `${modeLabel(mode)} — pick an answer` });
  const row = buildAnswerButtons(`${SESSION_BUTTON_PREFIX}:${sessionId}`, first);

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

export async function handleSessionAnswer(interaction, sessionId, questionId, chosenIndex) {
  const session = sessions.get(sessionId);

  if (!session || session.memberId !== interaction.user.id) {
    await interaction.reply({ content: "This quiz session has expired. Start a new one.", ephemeral: true });
    return;
  }

  const question = session.questions[session.index];
  if (!question || question.id !== questionId) {
    await interaction.reply({ content: "This question is no longer active in your session.", ephemeral: true });
    return;
  }

  const wasCorrect = chosenIndex === question.correctAnswer;
  if (wasCorrect) session.correctCount += 1;

  recordQuizAttempt({
    memberId: session.memberId,
    questionId: question.id,
    quizMode: session.mode,
    subject: question.subject,
    classKey: question.class,
    wasCorrect
  });

  const feedbackEmbed = buildFeedbackEmbed(question, wasCorrect);
  session.index += 1;

  if (session.index >= session.questions.length) {
    sessions.delete(sessionId);
    const summary = await buildSessionSummary(session);
    await interaction.update({ embeds: [feedbackEmbed, summary], components: [] });
    return;
  }

  const next = session.questions[session.index];
  const nextEmbed = buildQuestionEmbed(next, {
    questionNumber: session.index + 1,
    total: session.questions.length,
    footer: `${modeLabel(session.mode)} — pick an answer`
  });
  const nextRow = buildAnswerButtons(`${SESSION_BUTTON_PREFIX}:${sessionId}`, next);

  await interaction.update({ embeds: [feedbackEmbed, nextEmbed], components: [nextRow] });
}

async function buildSessionSummary(session) {
  const total = session.questions.length;
  const score = session.correctCount;
  const percentage = total > 0 ? score / total : 0;

  if (session.mode !== "chapter" && session.mode !== "final") {
    return new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle(`${modeLabel(session.mode)} Complete 🎉`)
      .setDescription(`You scored **${score}/${total}** (${Math.round(percentage * 100)}%).`);
  }

  const threshold = session.mode === "chapter" ? CHAPTER_PASS_THRESHOLD : FINAL_EXAM_PASS_THRESHOLD;
  const passed = percentage >= threshold;

  if (!passed) {
    return new EmbedBuilder()
      .setColor("#E74C3C")
      .setTitle(`${modeLabel(session.mode)} — Not Yet 📚`)
      .setDescription(
        `You scored **${score}/${total}** (${Math.round(percentage * 100)}%). ` +
        `You need **${Math.round(threshold * 100)}%** to pass.\n\n` +
        `Review the topics above and try again anytime — there's no limit on retries. ` +
        `This is about learning, not a one-shot test.`
      );
  }

  const targetClass = session.mode === "chapter" ? session.classKey : "graduation";
  recordChapterPass({ memberId: session.memberId, classKey: targetClass, score, totalQuestions: total });

  if (session.mode === "final") {
    return new EmbedBuilder()
      .setColor("#F1C40F")
      .setTitle("🎓 Final Examination Passed — Congratulations!")
      .setDescription(
        `You scored **${score}/${total}** (${Math.round(percentage * 100)}%). ` +
        `You're eligible for your Graduation Certificate!`
      );
  }

  const { classToTitle } = getCurriculumMapping();
  const nextClass = getMemberNextClass(session.memberId);
  const nextClassTitle = nextClass ? classToTitle[nextClass] || nextClass : null;

  return new EmbedBuilder()
    .setColor("#2ECC71")
    .setTitle(`✅ Chapter Assessment Passed — ${classToTitle[session.classKey] || session.classKey}`)
    .setDescription(
      `You scored **${score}/${total}** (${Math.round(percentage * 100)}%).\n\n` +
      (nextClassTitle
        ? `🔓 Unlocked: **${nextClassTitle}**`
        : `🎉 You've completed every chapter — the Final Examination is now available!`)
    );
}

// ── Optional modes ───────────────────────────────────────────────────

export async function startPracticeSession(interaction, { subject, difficulty = null, count = 5 }) {
  const questions = selectPracticeQuestions({ subject, difficulty, count });
  await startSession(interaction, { mode: "practice", questions, subject });
}

// ── Required modes ───────────────────────────────────────────────────

export async function startChapterAssessment(interaction, { classKey, count = 15 }) {
  if (!isClassUnlockedForMember(interaction.user.id, classKey)) {
    await interaction.reply({
      content: `🔒 This chapter isn't unlocked yet — complete the previous chapter's assessment first. Use \`/assessment progress\` to see where you are.`,
      ephemeral: true
    });
    return;
  }

  const questions = selectChapterAssessmentQuestions({ classKey, count });
  await startSession(interaction, { mode: "chapter", questions, classKey });
}

export async function startFinalExam(interaction, { count = 40 }) {
  if (!isClassUnlockedForMember(interaction.user.id, "graduation")) {
    await interaction.reply({
      content: `🔒 The Final Examination unlocks after you pass every Chapter Assessment through Class 12. Use \`/assessment progress\` to see where you are.`,
      ephemeral: true
    });
    return;
  }

  const questions = selectFinalExamQuestions({ count });
  await startSession(interaction, { mode: "final", questions });
}

export function getProgressForMember(memberId) {
  return getMemberProgressSummary(memberId);
}

// ── Community quizzes (posted by the Event Management module) — all OPTIONAL ──

export async function postCommunityQuiz(channel, { mode, memberIdForDaily = null, subject = null, classKey = null, count = null }) {
  let questions;

  if (mode === "daily") {
    questions = selectDailyQuizQuestions({ memberId: memberIdForDaily || "community", count: count || 1 });
  } else if (mode === "weekly") {
    questions = selectWeeklyQuizQuestions({ subject, classKey, count: count || 1 });
  } else if (mode === "monthly") {
    questions = selectMonthlyExamQuestions({ classKey, count: count || 1 });
  } else {
    throw new Error(`Unknown community quiz mode: ${mode}`);
  }

  if (questions.length === 0) {
    await channel.send("📚 No quiz questions are available yet for today's topic — check back soon!");
    return;
  }

  // Community posts are single-question-per-message by design: keeps
  // each post skimmable on mobile and makes the "one answer per
  // member per message" DB constraint straightforward.
  for (const question of questions) {
    const embed = buildQuestionEmbed(question, { footer: `${mode.toUpperCase()} QUIZ (optional) — click your answer` });
    const row = buildAnswerButtons(COMMUNITY_BUTTON_PREFIX, question);
    await channel.send({ embeds: [embed], components: [row] });
  }

  logger.info({ mode, count: questions.length }, "Posted community quiz");
}

export async function handleCommunityAnswer(interaction, questionId, chosenIndexRaw) {
  const chosenIndex = Number(chosenIndexRaw);
  const { getQuestionBank } = await import("./loader.js");
  const question = getQuestionBank().questions.find((q) => q.id === questionId);

  if (!question) {
    await interaction.reply({ content: "This question is no longer available.", ephemeral: true });
    return;
  }

  const wasCorrect = chosenIndex === question.correctAnswer;

  const isFirstAnswer = recordCommunityQuizAnswer({
    messageId: interaction.message.id,
    memberId: interaction.user.id,
    questionId: question.id,
    wasCorrect
  });

  if (!isFirstAnswer) {
    await interaction.reply({ content: "You've already answered this question.", ephemeral: true });
    return;
  }

  recordQuizAttempt({
    memberId: interaction.user.id,
    questionId: question.id,
    quizMode: "community",
    subject: question.subject,
    classKey: question.class,
    wasCorrect
  });

  const suggestedReview = `Review in Academy Hub → ${question.subject} → ${question.topic}`;
  const referenceLine = question.reference ? ` (Reference: ${question.reference})` : "";

  const feedback = wasCorrect
    ? `✅ Correct! ${question.explanation}${referenceLine}`
    : `❌ Not quite — the correct answer was **${OPTION_LETTERS[question.correctAnswer]}**. ${question.explanation}${referenceLine}\n📎 ${suggestedReview}`;

  await interaction.reply({ content: feedback, ephemeral: true });
}

export function getStatsForMember(memberId) {
  return getMemberQuizStats(memberId);
}

export { SESSION_BUTTON_PREFIX, COMMUNITY_BUTTON_PREFIX };
