// bot/src/modules/events/index.js
//
// Business logic backing the /event slash commands. Every recurring
// event (Sunday meeting, quizzes, challenges, announcements) is a row
// in recurring_events — created, edited, postponed, cancelled,
// resumed, or disabled entirely through these functions, entirely at
// runtime. There is no schedule of any kind in source code.

import { EmbedBuilder } from "discord.js";
import {
  createRecurringEvent,
  getRecurringEventByKey,
  listRecurringEvents,
  listDueRecurringEvents,
  updateRecurringEvent,
  deleteRecurringEvent,
  logAudit
} from "../../core/database.js";
import { computeNextRun } from "./recurrence.js";
import { getLogger } from "../../core/logger.js";

const logger = getLogger("events");

const VALID_TYPES = ["meeting", "quiz", "challenge", "announcement", "custom"];
const VALID_RECURRENCE = ["daily", "weekly", "monthly", "once"];

export function validateEventInput({ eventType, recurrenceRule, recurrenceDay }) {
  const errors = [];
  if (!VALID_TYPES.includes(eventType)) {
    errors.push(`event_type must be one of: ${VALID_TYPES.join(", ")}`);
  }
  if (!VALID_RECURRENCE.includes(recurrenceRule)) {
    errors.push(`recurrence must be one of: ${VALID_RECURRENCE.join(", ")}`);
  }
  if (recurrenceRule === "weekly" && !recurrenceDay) {
    errors.push("recurrence_day (e.g. SUNDAY) is required for weekly events");
  }
  if (recurrenceRule === "monthly" && !recurrenceDay) {
    errors.push("recurrence_day (day of month, e.g. 1) is required for monthly events");
  }
  return errors;
}

/**
 * Create a new recurring event and compute its first run time.
 */
export function createEvent({ eventKey, title, description, channelId, eventType, recurrenceRule, recurrenceDay, timeUtc, createdBy, quizSubject = null, quizClass = null, quizCount = null }) {
  const draftRow = {
    event_key: eventKey,
    title,
    description: description || null,
    channel_id: channelId,
    event_type: eventType,
    recurrence_rule: recurrenceRule,
    recurrence_day: recurrenceDay || null,
    recurrence_time_utc: timeUtc
  };

  const nextRun = computeNextRun(draftRow);

  const row = createRecurringEvent({
    ...draftRow,
    next_run_at: nextRun ? nextRun.toISOString() : null,
    quiz_subject: quizSubject,
    quiz_class: quizClass,
    quiz_count: quizCount,
    created_by: createdBy
  });

  logAudit("event_created", createdBy, null, { eventKey, eventType, recurrenceRule });
  logger.info({ eventKey, nextRun }, "Recurring event created");
  return row;
}

export function editEvent(eventKey, updates, editedBy) {
  const existing = getRecurringEventByKey(eventKey);
  if (!existing) return null;

  const merged = { ...existing, ...updates };
  const nextRun = computeNextRun(merged);

  const updated = updateRecurringEvent(eventKey, {
    ...updates,
    next_run_at: nextRun ? nextRun.toISOString() : null
  });

  logAudit("event_edited", editedBy, null, { eventKey, updates });
  return updated;
}

export function postponeEvent(eventKey, untilIso, actorId) {
  const existing = getRecurringEventByKey(eventKey);
  if (!existing) return null;

  const updated = updateRecurringEvent(eventKey, {
    status: "postponed",
    postponed_until: untilIso,
    next_run_at: untilIso
  });

  logAudit("event_postponed", actorId, null, { eventKey, untilIso });
  return updated;
}

export function cancelEvent(eventKey, actorId) {
  const updated = updateRecurringEvent(eventKey, { status: "cancelled", next_run_at: null });
  logAudit("event_cancelled", actorId, null, { eventKey });
  return updated;
}

export function resumeEvent(eventKey, actorId) {
  const existing = getRecurringEventByKey(eventKey);
  if (!existing) return null;

  const nextRun = computeNextRun(existing);
  const updated = updateRecurringEvent(eventKey, {
    status: "active",
    postponed_until: null,
    next_run_at: nextRun ? nextRun.toISOString() : null
  });

  logAudit("event_resumed", actorId, null, { eventKey });
  return updated;
}

export function disableEvent(eventKey, actorId) {
  const updated = updateRecurringEvent(eventKey, { status: "disabled", next_run_at: null });
  logAudit("event_disabled", actorId, null, { eventKey });
  return updated;
}

export function removeEvent(eventKey, actorId) {
  deleteRecurringEvent(eventKey);
  logAudit("event_deleted", actorId, null, { eventKey });
}

export function getEventsList(statusFilter = null) {
  return listRecurringEvents({ statusFilter });
}

/**
 * Called on a fixed short interval (e.g. every minute) by the
 * scheduler runner. Finds every event whose next_run_at has passed,
 * fires it, and reschedules it based on its recurrence rule — all
 * driven by data, never by a hardcoded cron string per event.
 */
export async function runDueEvents(client) {
  const dueEvents = listDueRecurringEvents(new Date().toISOString());

  for (const eventRow of dueEvents) {
    try {
      await fireEvent(client, eventRow);
    } catch (err) {
      logger.error({ err, eventKey: eventRow.event_key }, "Failed to fire event");
      continue;
    }

    if (eventRow.recurrence_rule === "once") {
      updateRecurringEvent(eventRow.event_key, {
        status: "disabled",
        last_run_at: new Date().toISOString(),
        next_run_at: null
      });
      continue;
    }

    const nextRun = computeNextRun(eventRow, new Date(Date.now() + 60_000));
    updateRecurringEvent(eventRow.event_key, {
      last_run_at: new Date().toISOString(),
      next_run_at: nextRun ? nextRun.toISOString() : null
    });
  }
}

async function fireEvent(client, eventRow) {
  const channel = await client.channels.fetch(eventRow.channel_id).catch(() => null);
  if (!channel || !channel.isTextBased()) {
    logger.warn({ eventKey: eventRow.event_key }, "Event channel could not be resolved, skipping fire");
    return;
  }

  if (eventRow.event_type === "quiz") {
    const { postCommunityQuiz } = await import("../quiz-engine/index.js");
    const mode = eventRow.recurrence_rule === "monthly" ? "monthly" : eventRow.recurrence_rule === "weekly" ? "weekly" : "daily";
    try {
      await postCommunityQuiz(channel, {
        mode,
        subject: eventRow.quiz_subject,
        classKey: eventRow.quiz_class,
        count: eventRow.quiz_count
      });
      logger.info({ eventKey: eventRow.event_key, mode }, "Fired recurring quiz event");
    } catch (err) {
      logger.error({ err, eventKey: eventRow.event_key }, "Failed to post community quiz");
    }
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(colorForType(eventRow.event_type))
    .setTitle(titleForType(eventRow.event_type, eventRow.title))
    .setDescription(eventRow.description || "");

  await channel.send({ embeds: [embed] });
  logger.info({ eventKey: eventRow.event_key }, "Fired recurring event");
}

function colorForType(eventType) {
  return { meeting: "#3498DB", quiz: "#9B59B6", challenge: "#E67E22", announcement: "#2ECC71", custom: "#95A5A6" }[eventType] || "#95A5A6";
}

function titleForType(eventType, title) {
  const prefixes = { meeting: "📅", quiz: "🧠", challenge: "🎯", announcement: "📢", custom: "🔔" };
  return `${prefixes[eventType] || "🔔"} ${title}`;
}
