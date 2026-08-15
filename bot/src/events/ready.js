// bot/src/events/ready.js

import { Events } from "discord.js";
import { config } from "../core/config.js";
import { getLogger } from "../core/logger.js";
import { syncServerIds } from "../core/discord-sync.js";
import { auditBotPermissions } from "../core/permissions.js";
import { BOT_RECOMMENDED_PERMISSIONS } from "../core/server-map.js";
import { setupSecurity } from "../modules/moderation-automod/index.js";
import { startEventScheduler } from "../automation/scheduler/index.js";

const logger = getLogger("ready");

export const name = Events.ClientReady;
export const once = true;

export async function execute(client) {
  logger.info({ tag: client.user.tag }, "Bot logged in");

  const guild = await client.guilds.fetch(config.discord.guildId).catch(() => null);
  if (!guild) {
    logger.error({ guildId: config.discord.guildId }, "Configured guild not found — is the bot invited to the right server?");
    return;
  }

  auditBotPermissions(guild, BOT_RECOMMENDED_PERMISSIONS);

  await syncServerIds(guild);

  try {
    await setupSecurity(guild);
  } catch (err) {
    logger.warn({ err }, "Security engine setup skipped an item (likely missing ManageGuild permission or already configured)");
  }

  startEventScheduler(client);

  logger.info("Startup sequence complete — bot is ready");
}
