// bot/src/events/guildAuditLogEntryCreate.js

import { Events } from "discord.js";
import { getLogger } from "../core/logger.js";
import { mirrorAuditLogEntry } from "../modules/moderation-automod/index.js";

const logger = getLogger("guildAuditLogEntryCreate");

export const name = Events.GuildAuditLogEntryCreate;
export const once = false;

export async function execute(entry, guild) {
  try {
    await mirrorAuditLogEntry(entry, guild);
  } catch (err) {
    logger.error({ err }, "Failed to mirror audit log entry");
  }
}
