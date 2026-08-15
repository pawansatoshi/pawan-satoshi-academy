// bot/src/modules/moderation-automod/nsfw.js
//
// Discord natively scans uploaded images for explicit content when
// the guild's Explicit Content Filter is set to "scan all members" —
// this is a free, built-in Discord feature (Trust & Safety
// infrastructure), so no paid image-moderation API is needed to
// satisfy the NSFW Protection requirement.

import { GuildExplicitContentFilterLevel } from "discord.js";
import { logAudit } from "../../core/database.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("nsfw-protection");

export async function setupNsfwProtection(guild) {
  if (guild.explicitContentFilter === GuildExplicitContentFilterLevel.AllMembers) {
    return; // already at the strictest setting, nothing to do
  }

  try {
    await guild.setExplicitContentFilter(
      GuildExplicitContentFilterLevel.AllMembers,
      "Bootstrap/security setup: scan media from all members for explicit content"
    );
    logAudit("nsfw_filter_enabled", "bot", guild.id, {});
    logger.info("Explicit content filter set to scan all members");
  } catch (err) {
    logger.error({ err }, "Failed to set explicit content filter — bot may be missing ManageGuild permission");
  }
}
