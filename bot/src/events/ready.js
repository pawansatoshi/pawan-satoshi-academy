// bot/src/events/ready.js

import { Events } from "discord.js";
import { config } from "../core/config.js";
import { getLogger } from "../core/logger.js";
import { syncServerIds } from "../core/discord-sync.js";
import { auditBotPermissions } from "../core/permissions.js";
import { BOT_RECOMMENDED_PERMISSIONS } from "../core/server-map.js";
import { setupSecurity } from "../modules/moderation-automod/index.js";
import { startEventScheduler } from "../automation/scheduler/index.js";
import { createEvent } from "../modules/events/index.js";
import { getRecurringEventByKey } from "../core/database.js";

const logger = getLogger("ready");

export const name = Events.ClientReady;
export const once = true;

async function ensureDefaultAcademyEvents(client) {
  const quizChannelId = (await import("../core/database.js")).getConfigValue("channel.quiz-arena");
  if (!quizChannelId) {
    logger.warn("Quiz channel is not configured — automatic daily quiz was not seeded");
    return;
  }

  if (getRecurringEventByKey("daily-community-quiz")) return;

  const hour = Math.min(23, Math.max(0, config.academyAutomation.dailyQuizHourIst));
  const utcHour = (hour - 5 + 24) % 24;
  const timeUtc = `${String(utcHour).padStart(2, "0")}:30`;

  createEvent({
    eventKey: "daily-community-quiz",
    title: "Daily Academy Quiz",
    description: "A daily optional community quiz. Answer directly in #quiz-arena and learn from the explanation.",
    channelId: quizChannelId,
    eventType: "quiz",
    recurrenceRule: "daily",
    recurrenceDay: null,
    timeUtc,
    createdBy: client.user.id,
    quizCount: Math.min(10, Math.max(1, config.academyAutomation.dailyQuizCount))
  });

  logger.info({ hourIst: hour, quizCount: config.academyAutomation.dailyQuizCount }, "Default daily community quiz scheduled");
}

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

  await ensureDefaultAcademyEvents(client);
  startEventScheduler(client);

  logger.info("Startup sequence complete — bot is ready");
}
