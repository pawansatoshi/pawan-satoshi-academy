// bot/src/events/guildMemberAdd.js

import { Events } from "discord.js";
import { getLogger } from "../core/logger.js";
import { assignDefaultRole } from "../modules/roles/index.js";
import { sendWelcome } from "../modules/welcome/index.js";
import { processJoin } from "../modules/moderation-automod/index.js";

const logger = getLogger("guildMemberAdd");

export const name = Events.GuildMemberAdd;
export const once = false;

export async function execute(member) {
  logger.info({ memberId: member.id }, "New member joined");

  const autoKicked = await processJoin(member);
  if (autoKicked) {
    // Anti-raid already removed this member — don't welcome/role a
    // member who is no longer in the server.
    return;
  }

  await assignDefaultRole(member);
  await sendWelcome(member);
}
