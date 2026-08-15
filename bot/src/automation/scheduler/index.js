// bot/src/automation/scheduler/index.js
//
// Ticks every 60 seconds and fires any recurring_events row whose
// next_run_at has passed. This is intentionally the ONLY place a
// setInterval exists for events — everything about WHEN something
// fires lives in the database (see modules/events), not here.

import { runDueEvents } from "../../modules/events/index.js";
import { runSecurityMaintenance } from "../../modules/moderation-automod/index.js";
import { config } from "../../core/config.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("scheduler");
const TICK_INTERVAL_MS = 60_000;

let intervalHandle = null;

async function tick(client) {
  await runDueEvents(client);

  const guild = client.guilds.cache.get(config.discord.guildId);
  if (guild) {
    await runSecurityMaintenance(guild);
  }
}

export function startEventScheduler(client) {
  if (intervalHandle) {
    logger.warn("Event scheduler already running — ignoring duplicate start");
    return;
  }

  logger.info("Event scheduler started (60s tick interval)");

  intervalHandle = setInterval(async () => {
    try {
      await tick(client);
    } catch (err) {
      logger.error({ err }, "Scheduler tick failed");
    }
  }, TICK_INTERVAL_MS);

  // Run once immediately on startup too, so events aren't delayed up
  // to a full minute after a restart.
  tick(client).catch((err) => logger.error({ err }, "Initial scheduler run failed"));
}

export function stopEventScheduler() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    logger.info("Event scheduler stopped");
  }
}
