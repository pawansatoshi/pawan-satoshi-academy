// bot/src/events/messageCreate.js

import { Events } from "discord.js";
import { getLogger } from "../core/logger.js";
import { processMessage } from "../modules/moderation-automod/index.js";

const logger = getLogger("messageCreate");

export const name = Events.MessageCreate;
export const once = false;

export async function execute(message) {
  if (!message.guild) return; // ignore DMs — nothing to moderate there

  try {
    await processMessage(message);
  } catch (err) {
    logger.error({ err, messageId: message.id }, "Error processing message through security engine");
  }
}
