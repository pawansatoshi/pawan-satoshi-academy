// bot/src/modules/moderation-automod/logging.js
//
// Mirrors two sources of truth into both the database and staff-only
// Discord channels: (1) Discord's own native audit log, via the
// guildAuditLogEntryCreate event, and (2) AutoMod rule executions.
// This is what makes the Audit System requirement real — staff see a
// live feed, and every entry is queryable later via /audit.

import { AuditLogEvent, EmbedBuilder } from "discord.js";
import { getConfigValue, logAudit, logModerationEvent } from "../../core/database.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("logging");

// Human-readable labels for the audit log action types we care most
// about surfacing to staff. Anything not in this map still gets
// logged to the database, just with a generic label in Discord.
const ACTION_LABELS = {
  [AuditLogEvent.MemberKick]: "Member Kicked",
  [AuditLogEvent.MemberBanAdd]: "Member Banned",
  [AuditLogEvent.MemberBanRemove]: "Member Unbanned",
  [AuditLogEvent.MemberUpdate]: "Member Updated (roles/timeout/nickname)",
  [AuditLogEvent.MemberRoleUpdate]: "Member Roles Changed",
  [AuditLogEvent.ChannelCreate]: "Channel Created",
  [AuditLogEvent.ChannelDelete]: "Channel Deleted",
  [AuditLogEvent.ChannelUpdate]: "Channel Updated",
  [AuditLogEvent.RoleCreate]: "Role Created",
  [AuditLogEvent.RoleDelete]: "Role Deleted",
  [AuditLogEvent.RoleUpdate]: "Role Updated",
  [AuditLogEvent.GuildUpdate]: "Server Settings Changed",
  [AuditLogEvent.AutoModerationRuleCreate]: "AutoMod Rule Created",
  [AuditLogEvent.AutoModerationRuleUpdate]: "AutoMod Rule Updated",
  [AuditLogEvent.AutoModerationRuleDelete]: "AutoMod Rule Deleted"
};

/**
 * Call from the guildAuditLogEntryCreate event.
 */
export async function mirrorAuditLogEntry(entry, guild) {
  logAudit(
    `discord_audit:${entry.action}`,
    entry.executorId || "unknown",
    entry.targetId || null,
    { reason: entry.reason || null, changes: entry.changes || [] }
  );

  const label = ACTION_LABELS[entry.action];
  if (!label) return; // not one of the high-signal actions — DB record is enough

  const auditChannelId = getConfigValue("channel.audit-logs");
  if (!auditChannelId) return;

  const channel = await guild.channels.fetch(auditChannelId).catch(() => null);
  if (!channel || !channel.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setColor("#95A5A6")
    .setTitle(label)
    .addFields(
      { name: "Executor", value: entry.executorId ? `<@${entry.executorId}>` : "Unknown", inline: true },
      { name: "Target", value: entry.targetId ? `\`${entry.targetId}\`` : "—", inline: true },
      { name: "Reason", value: entry.reason || "—", inline: false }
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch((err) => logger.error({ err }, "Failed to post audit log entry"));
}

/**
 * Call from the autoModerationActionExecution event.
 */
export async function mirrorAutoModExecution(execution, guild) {
  logModerationEvent({
    eventType: "automod_block",
    memberId: execution.userId,
    channelId: execution.channelId,
    ruleName: String(execution.ruleTriggerType ?? "unknown"),
    contentSnippet: (execution.matchedContent || execution.matchedKeyword || "").slice(0, 200)
  });

  const modLogChannelId = getConfigValue("channel.mod-logs");
  if (!modLogChannelId) return;

  const channel = await guild.channels.fetch(modLogChannelId).catch(() => null);
  if (!channel || !channel.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setColor("#E67E22")
    .setTitle("AutoMod Blocked a Message")
    .addFields(
      { name: "Member", value: `<@${execution.userId}>`, inline: true },
      { name: "Channel", value: execution.channelId ? `<#${execution.channelId}>` : "—", inline: true }
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch((err) => logger.error({ err }, "Failed to post AutoMod execution log"));
}
