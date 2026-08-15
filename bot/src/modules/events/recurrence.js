// bot/src/modules/events/recurrence.js
//
// Pure functions for computing "when does this event next run", given
// only data that lives in the database. No day/time/frequency is ever
// hardcoded here — every value comes from the recurring_events row.

const WEEKDAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

/**
 * Compute the next UTC run time for an event row.
 * @param {object} eventRow - a recurring_events database row
 * @param {Date} fromDate - reference point, defaults to now
 * @returns {Date}
 */
export function computeNextRun(eventRow, fromDate = new Date()) {
  const [hourStr, minuteStr] = eventRow.recurrence_time_utc.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  const next = new Date(fromDate);
  next.setUTCHours(hour, minute, 0, 0);

  switch (eventRow.recurrence_rule) {
    case "once": {
      // 'once' events use next_run_at set explicitly at creation time;
      // if that time has already passed, there is no next run.
      return next > fromDate ? next : null;
    }

    case "daily": {
      if (next <= fromDate) next.setUTCDate(next.getUTCDate() + 1);
      return next;
    }

    case "weekly": {
      const targetDay = WEEKDAYS.indexOf((eventRow.recurrence_day || "").toUpperCase());
      if (targetDay === -1) {
        throw new Error(`Invalid recurrence_day "${eventRow.recurrence_day}" for weekly event ${eventRow.event_key}`);
      }
      let daysUntilTarget = (targetDay - next.getUTCDay() + 7) % 7;
      if (daysUntilTarget === 0 && next <= fromDate) daysUntilTarget = 7;
      next.setUTCDate(next.getUTCDate() + daysUntilTarget);
      return next;
    }

    case "monthly": {
      const targetDayOfMonth = Number(eventRow.recurrence_day);
      if (!targetDayOfMonth || targetDayOfMonth < 1 || targetDayOfMonth > 31) {
        throw new Error(`Invalid recurrence_day "${eventRow.recurrence_day}" for monthly event ${eventRow.event_key}`);
      }
      next.setUTCDate(targetDayOfMonth);
      if (next <= fromDate) {
        next.setUTCMonth(next.getUTCMonth() + 1);
        next.setUTCDate(targetDayOfMonth);
      }
      return next;
    }

    default:
      throw new Error(`Unknown recurrence_rule "${eventRow.recurrence_rule}" for event ${eventRow.event_key}`);
  }
}

export function istHourToUtcHour(istHour) {
  // IST is UTC+5:30. This returns { hour, minute } in UTC for a given
  // whole IST hour (minute assumed 0) — used by the /event create
  // command when the operator specifies a time in IST for convenience.
  const totalMinutes = istHour * 60 - (5 * 60 + 30);
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  return { hour: Math.floor(normalized / 60), minute: normalized % 60 };
}
