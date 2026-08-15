// bot/tests/recurrence.test.js
//
// Tests for modules/events/recurrence.js — the pure scheduling math
// that backs /event create/edit. No hardcoded schedule exists in
// source; these tests confirm the calculation itself is correct.

import { test } from "node:test";
import assert from "node:assert/strict";
import { computeNextRun, istHourToUtcHour } from "../src/modules/events/recurrence.js";

test("istHourToUtcHour: 7 PM IST (19:00) converts to 13:30 UTC", () => {
  const { hour, minute } = istHourToUtcHour(19);
  assert.equal(hour, 13);
  assert.equal(minute, 30);
});

test("istHourToUtcHour: midnight IST wraps to previous UTC day correctly (18:30 UTC)", () => {
  const { hour, minute } = istHourToUtcHour(0);
  assert.equal(hour, 18);
  assert.equal(minute, 30);
});

test("computeNextRun: daily event later today schedules for today", () => {
  const from = new Date("2026-08-05T10:00:00Z");
  const row = { recurrence_rule: "daily", recurrence_time_utc: "13:30" };
  const next = computeNextRun(row, from);
  assert.equal(next.toISOString(), "2026-08-05T13:30:00.000Z");
});

test("computeNextRun: daily event earlier today rolls to tomorrow", () => {
  const from = new Date("2026-08-05T15:00:00Z");
  const row = { recurrence_rule: "daily", recurrence_time_utc: "13:30" };
  const next = computeNextRun(row, from);
  assert.equal(next.toISOString(), "2026-08-06T13:30:00.000Z");
});

test("computeNextRun: weekly Sunday meeting lands on the correct upcoming Sunday", () => {
  // 2026-08-05 is a Wednesday.
  const from = new Date("2026-08-05T10:00:00Z");
  const row = { recurrence_rule: "weekly", recurrence_day: "SUNDAY", recurrence_time_utc: "13:30" };
  const next = computeNextRun(row, from);
  assert.equal(next.getUTCDay(), 0); // Sunday
  assert.ok(next > from);
  assert.equal(next.toISOString(), "2026-08-09T13:30:00.000Z");
});

test("computeNextRun: weekly event on today's weekday, but time already passed, rolls to next week", () => {
  // 2026-08-05 is a Wednesday, 15:00 UTC is after the 13:30 target.
  const from = new Date("2026-08-05T15:00:00Z");
  const row = { recurrence_rule: "weekly", recurrence_day: "WEDNESDAY", recurrence_time_utc: "13:30" };
  const next = computeNextRun(row, from);
  assert.equal(next.toISOString(), "2026-08-12T13:30:00.000Z");
});

test("computeNextRun: monthly event on day 1, already past this month, rolls to next month", () => {
  const from = new Date("2026-08-05T10:00:00Z");
  const row = { recurrence_rule: "monthly", recurrence_day: "1", recurrence_time_utc: "09:00" };
  const next = computeNextRun(row, from);
  assert.equal(next.toISOString(), "2026-09-01T09:00:00.000Z");
});

test("computeNextRun: monthly event later this month stays in this month", () => {
  const from = new Date("2026-08-05T10:00:00Z");
  const row = { recurrence_rule: "monthly", recurrence_day: "20", recurrence_time_utc: "09:00" };
  const next = computeNextRun(row, from);
  assert.equal(next.toISOString(), "2026-08-20T09:00:00.000Z");
});

test("computeNextRun: 'once' event in the future returns that time", () => {
  const from = new Date("2026-08-05T10:00:00Z");
  const row = { recurrence_rule: "once", recurrence_time_utc: "23:59" };
  const next = computeNextRun(row, from);
  assert.equal(next.toISOString(), "2026-08-05T23:59:00.000Z");
});

test("computeNextRun: 'once' event whose time already passed today returns null", () => {
  const from = new Date("2026-08-05T23:59:30Z");
  const row = { recurrence_rule: "once", recurrence_time_utc: "10:00" };
  const next = computeNextRun(row, from);
  assert.equal(next, null);
});

test("computeNextRun: throws on invalid weekly day", () => {
  const row = { recurrence_rule: "weekly", recurrence_day: "FUNDAY", recurrence_time_utc: "10:00" };
  assert.throws(() => computeNextRun(row, new Date()));
});

test("computeNextRun: throws on unknown recurrence rule", () => {
  const row = { recurrence_rule: "biweekly", recurrence_time_utc: "10:00" };
  assert.throws(() => computeNextRun(row, new Date()));
});
