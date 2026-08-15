// bot/src/modules/moderation-automod/antiRaid.js
//
// Detects a burst of joins in a short window and enters "raid mode":
// temporarily raises the guild's verification level and auto-kicks
// very-new accounts, then automatically reverts once the window is
// quiet again. State is in-memory (per guild) — a bot restart simply
// resets to "not raiding," which is an acceptable, documented
// tradeoff for a free, self-hosted bot.

import { GuildVerificationLevel } from "discord.js";
import { getConfigValue, logAudit, logModerationEvent } from "../../core/database.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("anti-raid");

const RAID_JOIN_THRESHOLD = 6;      // this many joins...
const RAID_WINDOW_MS = 15_000;      // ...within this many milliseconds...
const RAID_MODE_DURATION_MS = 10 * 60_000; // ...triggers raid mode for this long
const MIN_ACCOUNT_AGE_MS = 7 * 24 * 60 * 60_000; // accounts younger than this are auto-kicked during raid mode

// guildId -> array of join timestamps (ms)
const joinTimestamps = new Map();
// guildId -> { active: boolean, until: number, previousVerificationLevel: number }
const raidState = new Map();

function getRecentJoins(guildId) {
  const now = Date.now();
  const timestamps = (joinTimestamps.get(guildId) || []).filter((t) => now - t < RAID_WINDOW_MS);
  joinTimestamps.set(guildId, timestamps);
  return timestamps;
}

export function isRaidModeActive(guildId) {
  const state = raidState.get(guildId);
  if (!state || !state.active) return false;
  if (Date.now() > state.until) {
    state.active = false;
    return false;
  }
  return true;
}

async function enterRaidMode(guild) {
  const state = raidState.get(guild.id) || {};
  if (state.active) {
    // Already raiding — extend the window instead of re-raising level.
    state.until = Date.now() + RAID_MODE_DURATION_MS;
    raidState.set(guild.id, state);
    return;
  }

  const previousVerificationLevel = guild.verificationLevel;
  try {
    if (guild.verificationLevel < GuildVerificationLevel.High) {
      await guild.setVerificationLevel(GuildVerificationLevel.High, "Anti-raid: automatic temporary lockdown");
    }
  } catch (err) {
    logger.error({ err }, "Failed to raise verification level during raid response");
  }

  raidState.set(guild.id, {
    active: true,
    until: Date.now() + RAID_MODE_DURATION_MS,
    previousVerificationLevel
  });

  logAudit("raid_mode_entered", "bot", guild.id, { previousVerificationLevel });
  logModerationEvent({ eventType: "raid_mode_entered", channelId: null });
  logger.warn({ guildId: guild.id }, "RAID DETECTED — entering raid mode");

  await postSecurityAlert(guild, "🚨 Raid Detected", "Unusual join activity detected. Verification level temporarily raised and new-account auto-kick is active.", "#E74C3C");
}

/**
 * Call this on a slow interval (the scheduler tick is fine) to revert
 * raid mode once its window has expired.
 */
export async function checkRaidModeExpiry(guild) {
  const state = raidState.get(guild.id);
  if (!state || !state.active) return;
  if (Date.now() < state.until) return;

  state.active = false;
  try {
    await guild.setVerificationLevel(state.previousVerificationLevel, "Anti-raid: lockdown window expired, reverting");
  } catch (err) {
    logger.error({ err }, "Failed to revert verification level after raid mode expired");
  }

  logAudit("raid_mode_exited", "bot", guild.id, {});
  logger.info({ guildId: guild.id }, "Raid mode expired — reverted to normal");
  await postSecurityAlert(guild, "✅ Raid Mode Ended", "Join activity has normalized. Verification level reverted.", "#2ECC71");
}

/**
 * Call from guildMemberAdd. Returns true if the member was
 * auto-kicked as a raid-mitigation measure (caller should skip
 * welcome/role-assignment in that case).
 */
export async function recordJoinAndCheckRaid(member) {
  const guildId = member.guild.id;
  const timestamps = getRecentJoins(guildId);
  timestamps.push(Date.now());
  joinTimestamps.set(guildId, timestamps);

  if (timestamps.length >= RAID_JOIN_THRESHOLD) {
    await enterRaidMode(member.guild);
  }

  if (isRaidModeActive(guildId)) {
    const accountAgeMs = Date.now() - member.user.createdTimestamp;
    if (accountAgeMs < MIN_ACCOUNT_AGE_MS) {
      try {
        await member.kick("Anti-raid: new account joined during active raid-mode lockdown");
        logModerationEvent({
          eventType: "raid_autokick",
          memberId: member.id,
          contentSnippet: `Account age: ${Math.round(accountAgeMs / 60_000)} min`
        });
        logAudit("raid_autokick", "bot", member.id, { accountAgeMs });
        logger.warn({ memberId: member.id }, "Auto-kicked new account during raid mode");
        return true;
      } catch (err) {
        logger.error({ err, memberId: member.id }, "Failed to auto-kick during raid mode");
      }
    }
  }

  return false;
}

async function postSecurityAlert(guild, title, description, color) {
  const modLogChannelId = getConfigValue("channel.mod-logs");
  if (!modLogChannelId) return;
  const channel = await guild.channels.fetch(modLogChannelId).catch(() => null);
  if (!channel || !channel.isTextBased()) return;

  const { EmbedBuilder } = await import("discord.js");
  const embed = new EmbedBuilder().setColor(color).setTitle(title).setDescription(description).setTimestamp();
  await channel.send({ embeds: [embed] }).catch(() => {});
}
