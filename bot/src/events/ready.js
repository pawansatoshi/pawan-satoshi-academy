import { Events } from "discord.js";
import { config } from "../core/config.js";
import { getLogger } from "../core/logger.js";
import { syncServerIds } from "../core/discord-sync.js";
import { auditBotPermissions } from "../core/permissions.js";
import { BOT_RECOMMENDED_PERMISSIONS } from "../core/server-map.js";
import { setupSecurity } from "../modules/moderation-automod/index.js";
import { startEventScheduler } from "../automation/scheduler/index.js";
import { createEvent } from "../modules/events/index.js";
import { getConfigValue, getRecurringEventByKey } from "../core/database.js";
import { istHourToUtcHour } from "../modules/events/recurrence.js";

const logger = getLogger("ready");
export const name = Events.ClientReady;
export const once = true;

function timeFromIst(hourIst) {
  const { hour, minute } = istHourToUtcHour(Math.min(23, Math.max(0, hourIst)));
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

async function ensureDefaultAcademyEvents(client) {
  const quizChannelId = getConfigValue("channel.quiz-arena");
  if (quizChannelId && !getRecurringEventByKey("daily-community-quiz")) {
    createEvent({
      eventKey: "daily-community-quiz",
      title: "Daily Academy Quiz",
      description: "A daily optional community quiz. Answer directly in #quiz-arena and learn from the explanation.",
      channelId: quizChannelId,
      eventType: "quiz",
      recurrenceRule: "daily",
      recurrenceDay: null,
      timeUtc: timeFromIst(config.academyAutomation.dailyQuizHourIst),
      createdBy: client.user.id,
      quizCount: Math.min(10, Math.max(1, config.academyAutomation.dailyQuizCount))
    });
    logger.info("Default daily community quiz scheduled");
  }

  const meetingChannelId = getConfigValue("channel.announcements") || getConfigValue("channel.academy-hub");
  if (meetingChannelId && !getRecurringEventByKey("weekly-academy-meeting")) {
    createEvent({
      eventKey: "weekly-academy-meeting",
      title: "Weekly Academy Meeting",
      description: "Weekly Academy community meeting. Bring questions, project updates and useful learning resources.",
      channelId: meetingChannelId,
      eventType: "meeting",
      recurrenceRule: "weekly",
      recurrenceDay: config.meeting.day,
      timeUtc: timeFromIst(config.meeting.hourIst),
      createdBy: client.user.id
    });
    logger.info({ day: config.meeting.day, hourIst: config.meeting.hourIst }, "Default weekly Academy meeting scheduled");
  }
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
  try { await setupSecurity(guild); } catch (err) { logger.warn({ err }, "Security engine setup skipped an item"); }
  await ensureDefaultAcademyEvents(client);
  startEventScheduler(client);
  logger.info("Startup sequence complete — bot is ready");
}
