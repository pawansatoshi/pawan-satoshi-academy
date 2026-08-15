// bot/src/modules/moderation-automod/automod.js
//
// Native Discord AutoMod rules (guild.autoModerationRules) —
// requires ManageGuild, never Administrator. Creates rules only if
// they don't already exist (idempotent, never deletes existing rules
// automatically).

import { AutoModerationRuleTriggerType, AutoModerationActionType, AutoModerationRuleEventType } from "discord.js";
import { getConfigValue, logModerationEvent } from "../../core/database.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("moderation-automod");

const SCAM_KEYWORDS = [
  "free nitro", "nitro giveaway", "claim your airdrop now", "seed phrase",
  "private key", "dm me for", "steam gift", "double your crypto",
  "wallet recovery phrase", "connect wallet to claim", "verify wallet now",
  "you have been selected", "congratulations you won"
];

/**
 * Creates the two baseline AutoMod rules (scam-keyword filter,
 * mention-spam guard) if they don't already exist. Safe to call
 * repeatedly.
 */
export async function setupAutoMod(guild) {
  const existingRules = await guild.autoModerationRules.fetch();

  const modLogChannelId = getConfigValue("channel.mod-logs");

  if (!existingRules.find((r) => r.name === "PSA Scam & Phishing Filter")) {
    await guild.autoModerationRules.create({
      name: "PSA Scam & Phishing Filter",
      eventType: AutoModerationRuleEventType.MessageSend,
      triggerType: AutoModerationRuleTriggerType.Keyword,
      triggerMetadata: { keywordFilter: SCAM_KEYWORDS },
      actions: [
        { type: AutoModerationActionType.BlockMessage },
        ...(modLogChannelId
          ? [{ type: AutoModerationActionType.SendAlertMessage, metadata: { channelId: modLogChannelId } }]
          : [])
      ],
      enabled: true,
      reason: "Bootstrap: baseline scam/phishing keyword protection"
    });
    logger.info("Created AutoMod rule: PSA Scam & Phishing Filter");
  }

  if (!existingRules.find((r) => r.name === "PSA Mention Spam Guard")) {
    await guild.autoModerationRules.create({
      name: "PSA Mention Spam Guard",
      eventType: AutoModerationRuleEventType.MessageSend,
      triggerType: AutoModerationRuleTriggerType.MentionSpam,
      triggerMetadata: { mentionTotalLimit: 5 },
      actions: [
        { type: AutoModerationActionType.BlockMessage },
        ...(modLogChannelId
          ? [{ type: AutoModerationActionType.SendAlertMessage, metadata: { channelId: modLogChannelId } }]
          : [])
      ],
      enabled: true,
      reason: "Bootstrap: baseline mass-mention/raid protection"
    });
    logger.info("Created AutoMod rule: PSA Mention Spam Guard");
  }
}

/**
 * Call from the autoModerationActionExecution event to persist a
 * record of every blocked message for later staff review.
 */
export function recordAutoModAction(execution) {
  logModerationEvent({
    eventType: "automod_block",
    memberId: execution.userId,
    channelId: execution.channelId,
    ruleName: execution.ruleTriggerType?.toString() ?? "unknown",
    contentSnippet: (execution.matchedContent || "").slice(0, 200)
  });
  logger.info({ userId: execution.userId }, "AutoMod blocked a message");
}
