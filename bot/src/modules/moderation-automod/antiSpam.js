// bot/src/modules/moderation-automod/antiSpam.js
//
// In-memory per-user message rate limiting. Discord's native AutoMod
// Spam trigger is a black-box preset with no configurable threshold,
// so this gives explicit, tunable control: N messages in M seconds,
// or the same message repeated K times in a row, triggers a timeout
// and deletes the offending messages.

import { logAudit, logModerationEvent } from "../../core/database.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("anti-spam");

const RATE_LIMIT_COUNT = 5;      // this many messages...
const RATE_LIMIT_WINDOW_MS = 5_000; // ...within this many ms...
const DUPLICATE_LIMIT = 3;       // ...or the same content this many times in a row...
const TIMEOUT_DURATION_MS = 5 * 60_000; // ...triggers this timeout

// userId -> { timestamps: number[], lastContent: string, repeatCount: number, messages: Message[] }
const userState = new Map();

function getState(userId) {
  if (!userState.has(userId)) {
    userState.set(userId, { timestamps: [], lastContent: null, repeatCount: 0, recentMessages: [] });
  }
  return userState.get(userId);
}

/**
 * Call from messageCreate for every non-bot message. Returns true if
 * the message triggered a spam action (caller doesn't need to do
 * anything further — deletion/timeout already happened here).
 */
export async function checkMessageForSpam(message) {
  if (message.author.bot) return false;
  if (!message.member) return false;

  const state = getState(message.author.id);
  const now = Date.now();

  state.timestamps = state.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  state.timestamps.push(now);

  state.recentMessages.push(message);
  if (state.recentMessages.length > RATE_LIMIT_COUNT) state.recentMessages.shift();

  if (message.content && message.content === state.lastContent) {
    state.repeatCount += 1;
  } else {
    state.lastContent = message.content;
    state.repeatCount = 1;
  }

  const rateExceeded = state.timestamps.length > RATE_LIMIT_COUNT;
  const duplicateExceeded = state.repeatCount >= DUPLICATE_LIMIT;

  if (!rateExceeded && !duplicateExceeded) return false;

  const reason = rateExceeded
    ? `Rate limit: >${RATE_LIMIT_COUNT} messages in ${RATE_LIMIT_WINDOW_MS / 1000}s`
    : `Duplicate flood: same message ${state.repeatCount}x in a row`;

  await handleSpamDetected(message, reason, rateExceeded ? state.recentMessages : [message]);

  state.timestamps = [];
  state.repeatCount = 0;
  state.recentMessages = [];

  return true;
}

async function handleSpamDetected(message, reason, messagesToDelete) {
  const member = message.member;

  for (const msg of messagesToDelete) {
    await msg.delete().catch(() => {});
  }

  try {
    if (member.moderatable) {
      await member.timeout(TIMEOUT_DURATION_MS, `Anti-spam: ${reason}`);
    }
  } catch (err) {
    logger.error({ err, memberId: member.id }, "Failed to timeout member for spam");
  }

  logModerationEvent({
    eventType: "spam_timeout",
    memberId: member.id,
    channelId: message.channelId,
    contentSnippet: reason
  });
  logAudit("spam_detected", "bot", member.id, { reason });
  logger.warn({ memberId: member.id, reason }, "Spam detected and mitigated");
}

/**
 * Periodic cleanup so the in-memory map doesn't grow unbounded on a
 * long-running process. Safe to call from the scheduler tick.
 */
export function pruneStaleSpamState() {
  const now = Date.now();
  for (const [userId, state] of userState.entries()) {
    const hasRecent = state.timestamps.some((t) => now - t < RATE_LIMIT_WINDOW_MS * 4);
    if (!hasRecent) userState.delete(userId);
  }
}
