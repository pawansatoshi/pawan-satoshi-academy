// bot/src/modules/moderation-automod/index.js
//
// Aggregates the full Security Engine. This is the only file other
// parts of the bot (events, commands) import from this module —
// individual submodules (antiSpam.js, antiRaid.js, etc.) are
// implementation detail.

import { setupAutoMod } from "./automod.js";
import { setupNsfwProtection } from "./nsfw.js";
import { checkMessageForSpam, pruneStaleSpamState } from "./antiSpam.js";
import { checkMessageForPhishing } from "./antiPhishing.js";
import { recordJoinAndCheckRaid, checkRaidModeExpiry, isRaidModeActive } from "./antiRaid.js";
import { mirrorAuditLogEntry, mirrorAutoModExecution } from "./logging.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("security-engine");

/**
 * Run once per guild at bot startup (called from ready.js). Sets up
 * native AutoMod rules and the explicit content filter. Idempotent —
 * safe to call on every restart.
 */
export async function setupSecurity(guild) {
  await setupAutoMod(guild);
  await setupNsfwProtection(guild);
  logger.info({ guildId: guild.id }, "Security engine initialized");
}

/**
 * Call from messageCreate for every non-bot message. Runs anti-spam
 * first (cheapest, most common trigger), then anti-phishing. Stops at
 * the first action taken — a message that's already been deleted for
 * spam doesn't need a second phishing check.
 */
export async function processMessage(message) {
  if (message.author.bot) return;

  const spamHandled = await checkMessageForSpam(message);
  if (spamHandled) return;

  await checkMessageForPhishing(message);
}

/**
 * Call from guildMemberAdd, BEFORE welcome/role assignment. Returns
 * true if the member was auto-kicked as a raid mitigation (caller
 * should stop processing this join if so).
 */
export async function processJoin(member) {
  return recordJoinAndCheckRaid(member);
}

/**
 * Call on every scheduler tick (~60s) to expire raid mode and prune
 * stale in-memory rate-limit state.
 */
export async function runSecurityMaintenance(guild) {
  await checkRaidModeExpiry(guild);
  pruneStaleSpamState();
}

export { mirrorAuditLogEntry, mirrorAutoModExecution, isRaidModeActive };
