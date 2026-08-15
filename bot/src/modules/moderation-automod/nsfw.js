// bot/src/modules/moderation-automod/nsfw.js
//
// Discord natively scans uploaded images for explicit content when
// the guild's Explicit Content Filter is set to "scan all members" —
// this is a free, built-in Discord feature (Trust & Safety
// infrastructure), so no paid image-moderation API is needed to
// satisfy the NSFW Protection requirement.
//
// NOTE: GuildExplicitContentFilter is a TypeScript/API enum and is not
// available as a runtime named export from the CommonJS build of the
// installed discord.js package. Discord's API defines ALL_MEMBERS as 2.

import { logAudit } from "../../core/database.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("nsfw-protection");
const ALL_MEMBERS_EXPLICIT_FILTER = 2;

export async function setupNsfwProtection(guild) {
  if (guild.explicitContentFilter === ALL_MEMBERS_EXPLICIT_FILTER) {
    return; // already at the strictest setting, nothing to do
  }

  try {
    await guild.setExplicitContentFilter(
      ALL_MEMBERS_EXPLICIT_FILTER,
      "Bootstrap/security setup: scan media from all members for explicit content"
    );
    logAudit("nsfw_filter_enabled", "bot", guild.id, {});
    logger.info("Explicit content filter set to scan all members");
  } catch (err) {
    logger.error({ err }, "Failed to set explicit content filter — bot may be missing ManageGuild permission");
  }
}
