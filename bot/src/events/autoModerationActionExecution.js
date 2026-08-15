// bot/src/events/autoModerationActionExecution.js

import { Events } from "discord.js";
import { getLogger } from "../core/logger.js";
import { mirrorAutoModExecution } from "../modules/moderation-automod/index.js";

const logger = getLogger("autoModerationActionExecution");

export const name = Events.AutoModerationActionExecution;
export const once = false;

export async function execute(execution) {
  try {
    await mirrorAutoModExecution(execution, execution.guild);
  } catch (err) {
    logger.error({ err }, "Failed to mirror AutoMod execution");
  }
}
